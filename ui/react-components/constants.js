const hostUrl = localStorage.getItem('host') ? ("https://" + localStorage.getItem('host')) : "";
const restWestV1 = `${hostUrl}/openmrs/ws/rest/v1`;
const bahmniCore = `${restWestV1}/bahmnicore`;

export const appointmentService = `${restWestV1}/appointmentService`;
export const searchPatientUrl = `${bahmniCore}/search/patient`;
export const servicesDefaultUrl = `${appointmentService}/all/default`;
export const providerUrl = `${restWestV1}/provider`;
export const providerParams = `v=custom:(display,person,uuid,retired,attributes:(attributeType:(display),value,voided))`;
export const availableForAppointments = "Available for appointments";
export const locationUrl = `${restWestV1}/location`;

export const appName = 'appointments';

export const BAHMNI_CONFIG_URL = `${hostUrl}/bahmni_config/openmrs/apps`;
export const IMPLEMENTATION_CONFIG_URL = `${hostUrl}/implementation_config/openmrs/apps`;
