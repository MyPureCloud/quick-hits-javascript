// >> START premium-wizard A guide on customizing the Premium App Wizard provisioning template
import config from '../config/config.js';
import view from './view.js';

// Module scripts
import roleModule from './modules/role.js';
import groupModule from './modules/group.js';
import appInstanceModule from './modules/app-instance.js';
import OAuthClientModule from './modules/oauth-client.js';
import dataTableModule from './modules/data-table.js';

// Add new modules here
// This will later be filtered in setup() to only use
// what's in the config
let modules = [
    roleModule, 
    groupModule, 
    appInstanceModule, 
    OAuthClientModule,
    dataTableModule
];

const jobOrder = config.provisioningInfo;
const prefix = config.prefix;

// Genesys Cloud
const platformClient = require('platformClient');
let client = null;
const integrationsApi = new platformClient.IntegrationsApi();


// Global data
let userMe = null; // Genesys Cloud user object
let integrationId = ''; // Integration instance ID
let installedData = {}; // Everything that's installed after


/**
 * Get's all the currently installed items as defined in the
 * job order.
 * @returns {Promise} Array of the installed objects
 */
function getInstalledObjects(){
    let promiseArr = [];

    modules.forEach((module) => {
        if(jobOrder[module.provisioningInfoKey]){
            promiseArr.push(module.getExisting());
        }
    });

    return Promise.all(promiseArr);
}

/**
 * Run against the global installedData so it will just contain id and
 * name of the installed Genesys Cloud objects
 * @returns {Object} SImplified object data of installed items
 */
function simplifyInstalledData(){
    let result = {};
    Object.keys(installedData).forEach(modKey => {
        let modItems = installedData[modKey];
        result[modKey] = {};

        Object.keys(modItems).forEach(itemName => {
            let itemVal = modItems[itemName];
            result[modKey][itemName] = {
                id: itemVal.id,
                name: itemVal.name,
            }
        })
    });
    
    return result;
}

export default {
    /**
     * Setup the wizard with references
     * @param {Object} pcClient Genesys Cloud API Client
     * @param {Object} user Genesys Cloud user object
     * @param {String} instanceId ID of the working integration instance 
     */
    setup(pcClient, user, instanceId){
        client = pcClient;
        userMe = user;
        integrationId = instanceId;
        
        // Use only modules in provisioning info
        modules = modules.filter((module) => {
            return Object.keys(config.provisioningInfo)
                    .includes(module.provisioningInfoKey);
        });
    },

    getInstalledObjects: getInstalledObjects,

    // >> START premium-wizard-step-9
    /**
     * Checks if any installed objects are still existing
     * @returns {Promise<boolean>}
     */
    isExisting(){
        let exists = false;

        return getInstalledObjects()
        .then((installed) => {
            console.log(installed);
            installed.forEach(item => {
                if(item.total && item.total > 0){
                    // If it's  a Genesys Cloud search reslts
                    exists = true;
                }else{
                    // if it's just an array
                    exists = item.length > 0 ? true : exists;
                }
            });

            return exists;
        })
        .catch((e) => console.error(e));
    },
    // >> END premium-wizard-step-9

    // >> START premium-wizard-step-11  
    /**
     * Installs all the modules
     * @returns {Promise<Array>} array of finally function resolves
     */
    install(){
        let creationPromises = [];
        let configurationPromises = [];
        let finalFunctionPromises = [];

        // Create all the items
        modules.forEach((module) => {
            let moduleProvisioningData = config.provisioningInfo[module.provisioningInfoKey];

            if(!moduleProvisioningData) return;

            creationPromises.push(
                module.create(
                    view.showLoadingModal, 
                    moduleProvisioningData
                )
            );
        });
    // >> END premium-wizard-step-11
        // >> START premium-wizard-step-12
        return Promise.all(creationPromises)
        .then((result) => {
            // Configure all items
            modules.forEach((module, i) => {
                installedData[module.provisioningInfoKey] = result[i]; 
            });

            modules.forEach((module) => {
                configurationPromises.push(
                    module.configure(
                        view.showLoadingModal,
                        installedData,
                        userMe.id
                    )
                );
            });

            return Promise.all(configurationPromises);
        })
        // >> END premium-wizard-step-12
        .then(() => {
            view.showLoadingModal('Executing Final Steps...');

            // Loop through all items with finally 
            Object.keys(config.provisioningInfo).forEach(key => {
                let provisionItems = config.provisioningInfo[key];
                provisionItems.forEach((item) => {
                    if(item.finally){
                        finalFunctionPromises.push(
                            item.finally(installedData[key][item.name])
                        );
                    }
                })
            });

            return Promise.all(finalFunctionPromises);
        })
        // >> START premium-wizard-step-13
        // Store the installedData in the integration's description
        .then(() => {
            console.log(installedData)
            return integrationsApi.getIntegrationConfigCurrent(integrationId)
            .then((instance) => {
                let body = instance;
                let simplifiedData = simplifyInstalledData();
                
                body.notes = JSON.stringify(simplifiedData);

                return integrationsApi.putIntegrationConfigCurrent(
                            integrationId, { body: body });
            })
        })
        // >> END premium-wizard-step-13
        .catch((e) => console.error(e));
    },

    // >> START premium-wizard-step-14
    /**
     * Uninstall all the modules
     * @returns {Promise<Array>} module remove promises
     */
    uninstall(){
        let promiseArr = [];

        modules.forEach((module) => {
            promiseArr.push(
                module.remove(view.showLoadingModal)
            );
        });

        return Promise.all(promiseArr);
    }
    // >> END premium-wizard-step-14
}
// >> END premium-wizard