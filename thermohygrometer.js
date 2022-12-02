const Obniz = require("obniz");
const obniz = new Obniz("2408-7253");

obniz.onconnect = async () => {
  log("obniz connected");
  var servo = obniz.wired("ServoMotor", {gnd:0, vcc:1, signal:2});
  await obniz.ble.initWait();
  const MESH_100TH = Obniz.getPartsClass("MESH_100TH");
  obniz.ble.scan.onfind = async (peripheral) => {
    log("name:", peripheral.localName);
    if (!MESH_100TH.isMESHblock(peripheral)) {
      return;
    }
    log("found");

    // Create an instance
    const temphumidBlock = new MESH_100TH(peripheral);

    // Connect to the Brightness block
    await temphumidBlock.connectWait();

    temphumidBlock.onSensorEvent = (temperature, humidity) => {
      log("temperature: " + temperature + ", humidity: " + humidity);
    };

    log("connected");

    while (peripheral.connected) {
      const data = await temphumidBlock.getSensorDataWait();
      log("temperature: " + data.temperature + ", humidity: " + data.humidity);
      
      servo.angle(90.0);
      if (data.temperature < 23) {
        servo.angle(120.0);
        await wait(1000);
      } else if (data.temperature > 25) {
        servo.angle(60.0);
        await wait(1000);
      }
      servo.angle(90.0); // half position
      await wait(60 * 100);
    }
  };

  await obniz.ble.scan.startWait(
    { localNamePrefix: "MESH-100" },
    { duration: null }
  );
};

const log = (...args) => {
  console.log(new Date(), ...args);
};
const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};