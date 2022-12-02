const Obniz = require("obniz");
const obniz = new Obniz("2408-7253");

//second commit変更１
var mode_flg = "stop"

obniz.onconnect = async () => {
  log("obniz connected");
  var servo = obniz.wired("ServoMotor", {gnd:0, vcc:1, signal:2});
  //second commit変更２
  var servo2 = obniz.wired("ServoMotor", {gnd:3, vcc:4, signal:5});
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
      log("temperature: " + data.temperature + ", humidity: " + data.humidity + ", mode_flg: " + mode_flg);
      servo.angle(90.0);
      //second commit変更３
      servo2.angle(90.0);
      //second commit変更４ if文の条件を追加
      if (data.temperature <= 24 && mode_flg != "heating") {
        mode_flg = "heating";
        servo.angle(120.0);
        await wait(1000);
      } else if (data.temperature > 24 && data.temperature < 25 && mode_flg != "stop") {
        servo2.angle(110.0);
        if (mode_flg == "heating") {
          //だんぼうけしたよ
        } else if (mode_flg == "cooling") {
          //れいぼうけしたよ
        }
        await wait(1000);
        mode_flg = "stop";
      } else if (data.temperature >= 25 && mode_flg != "cooling") {
        mode_flg = "cooling";
        servo.angle(60.0);
        await wait(1000);
      }
      servo.angle(90.0); // half position
      //second commit変更５
      servo2.angle(90.0);
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