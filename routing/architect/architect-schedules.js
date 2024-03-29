// >> START architect-schedules See how to query architect flows for their schedule and determine if an IVR is currently open or closed
const rrulestr = require('rrule').rrulestr;
const moment = require('moment');
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;

// >> START architect-schedules-step-3
function isCurrentlyInSchedule(schedule) {
	var rule = rrulestr('RRULE:' + schedule.rrule);

	var nextOccurance = rule.after(moment().startOf('day').toDate(), true);
	console.log(`nextOccurance ${nextOccurance}`);

	var doesMatchDay = moment(nextOccurance).isSame(moment(), 'day');

	if (!doesMatchDay) {
		return false;
	}

	var date = moment().format('YYYY-MM-DD');

	var start = moment(date + 'T' + schedule.start.split('T')[1]);
	var end = moment(date + 'T' + schedule.end.split('T')[1]);

	return moment().isBetween(start, end);
}
// >> END architect-schedules-step-3

// >> START architect-schedules-step-2
function evaluateScheduleGroup(scheduleGroup) {
	let architectApi = new platformClient.ArchitectApi();

	let openSchedulePromises = [];
	let closedSchedulePromises = [];

	for (let x = 0; x < scheduleGroup.openSchedules.length; x++) {
		openSchedulePromises.push(architectApi.getArchitectSchedule(scheduleGroup.openSchedules[x].id));
	}

	for (let x = 0; x < scheduleGroup.closedSchedules.length; x++) {
		closedSchedulePromises.push(architectApi.getArchitectSchedule(scheduleGroup.closedSchedules[x].id));
	}

	Promise.all(openSchedulePromises)
		.then((openSchedules) => {
			let isOpen = false;

			for (let x = 0; x < openSchedules.length; x++) {
				if (isCurrentlyInSchedule(openSchedules[x])) {
					isOpen = true;
				}
			}

			if (isOpen) {
				Promise.all(closedSchedulePromises).then((closedSchedules) => {
					for (let x = 0; x < closedSchedules.length; x++) {
						if (isCurrentlyInSchedule(closedSchedules[x])) {
							isOpen = false;
						}
					}
					console.log(`IVR is open? ${isOpen}`);
				});
			} else {
				console.log(`IVR is open? ${isOpen}`);
			}
		})
		.catch(console.log);
}
// >> END architect-schedules-step-2

// Get client credentials from environment variables
const CLIENT_ID = process.env.GENESYS_CLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const ORG_REGION = process.env.GENESYS_CLOUD_REGION; // eg. us_east_1

// Set environment
const environment = platformClient.PureCloudRegionHosts[ORG_REGION];
if(environment) client.setEnvironment(environment);

client
	.loginClientCredentialsGrant(CLIENT_ID, CLIENT_SECRET)
	.then(() => {
		var architectApi = new platformClient.ArchitectApi();
		// >> START architect-schedules-step-1
		const IVR_NAME = 'Queue 1';
		architectApi
			.getArchitectIvrs({ name: IVR_NAME })
			.then((ivrs) => {
				console.log(ivrs);
				let ivr = ivrs.entities[0];

				let scheduleGroupId = ivr.scheduleGroup.id;

				architectApi.getArchitectSchedulegroup(scheduleGroupId).then(function(scheduleGroup) {
					evaluateScheduleGroup(scheduleGroup);
				});
			})
			.catch(console.log);
		// >> END architect-schedules-step-1
	})
	.catch(console.log);
// >> END architect-schedules
