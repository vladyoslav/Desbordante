import { v4 as UUIDv4 } from 'uuid';

const generateDeviceInfo = async () => {
  const { ClientJS } = await import('clientjs');
  const client = new ClientJS();
  const deviceAttributes = {
    deviceID: `${UUIDv4()}:${client.getFingerprint()}`,
    userAgent: client.getUserAgent(),
    browser: client.getBrowser(),
    engine: client.getEngine(),
    os: client.getOS(),
    osVersion: client.getOSVersion(),
    device: client.getDevice(),
    cpu: client.getCPU(),
    screen: client.getScreenPrint(),
    plugins: client.getPlugins(),
    timeZone: client.getTimeZone(),
    language: client.getLanguage(),
  };
  const deviceInfo = JSON.stringify(deviceAttributes);
  const { deviceID } = deviceAttributes;

  return { deviceID, deviceInfoBase64: window.btoa(deviceInfo) };
};

export default async function setupDeviceInfo() {
  if (
    !localStorage.getItem('deviceInfo') ||
    !localStorage.getItem('deviceID')
  ) {
    const { deviceID, deviceInfoBase64 } = await generateDeviceInfo();
    localStorage.setItem('deviceID', deviceID);
    localStorage.setItem('deviceInfo', deviceInfoBase64);
  }
}
