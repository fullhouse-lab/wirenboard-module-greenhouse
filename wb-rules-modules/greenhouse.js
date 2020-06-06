//TODO check after reboot
// TODO: add gist range

var MODULE_NAME 		= "greenhouse";
var MODULE_VERSION  = "1.7.0";

exports.start = function(config) {
  if (!validateConfig(config)) return;

  //  device  //
	createDevice(config);

  //  rules  //
  createRule_temperature(config.id,
    config.temperature.device,
    config.temperature.control);
  createRule_range_target(config.id);
  createRule_switch_window(config.id,
    config.window.device,
    config.window.control);

  log(config.id + ": Started (" + MODULE_NAME + " ver. " + MODULE_VERSION + ")");
};

//  Validate config  //

var validateConfig = function(_config) {
  if (!_config) {
    log("Error: " + MODULE_NAME + ": No config");
    return false;
  }

  if (!_config.id || !_config.id.length) {
    log("Error: " + MODULE_NAME + ": Config: Bad id");
    return false;
  }

  if (!_config.title || !_config.title.length) {
    log("Error: " + MODULE_NAME + ": Config: Bad title");
    return false;
  }

  if (!_config.temperature
    || !_config.temperature.device
    || !_config.temperature.control) {
    log("Error: " + MODULE_NAME + ": Config: Bad temperature");
    return false;
  }

  if (!_config.window
    || !_config.window.device
    || !_config.window.control) {
    log("Error: " + MODULE_NAME + ": Config: Bad window");
    return false;
  }

  return true;
}

//
//  Device  //
//

function createDevice(config) {
  var window_value = dev[config.window.device][config.window.control];

	var cells = {
		enabled:      { type: "switch", value: true, readonly: false  },
    temperature:  { type: "value",  value: 0 },
    window:       { type: "switch", value: window_value, forceDefault: true, readonly: false },
    target:       { type: "range",  max: 35, value: 0, readonly: false  }
	}

	defineVirtualDevice(config.id, {
	  title: config.title,
	  cells: cells
	});
}

//
//  Rules  //
//

//  sensor -> temperature  //

function createRule_temperature(device_id, device, control) {
  defineRule({
    whenChanged: device + "/" + control,
    then: function (newValue, devName, cellName) {
      if (dev[device_id]["temperature"] === newValue) return;
      dev[device_id]["temperature"] = newValue;

      if (dev[device_id]["enabled"]) {
        temperature_check(device_id);
      }
    }.bind(this)
  });
}

//  Range: target  //

function createRule_range_target(device_id) {
  defineRule({
    whenChanged: device_id + "/target",
    then: function (newValue, devName, cellName) {
      log(device_id + ": New target: " + newValue);
      if (dev[device_id]["enabled"]) {
        temperature_check(device_id);
      }
    }.bind(this)
  });
}

//  Switch: window   //

function createRule_switch_window(device_id, device, control) {
  defineRule({
    whenChanged: device_id + "/window",
    then: function (newValue, devName, cellName) {
      if (dev[device][control] !== newValue) dev[device][control] = newValue;
    }
  });

  defineRule({
    whenChanged: device + "/" + control,
    then: function (newValue, devName, cellName) {
      if (dev[device_id]["window"] !== newValue) dev[device_id]["window"] = newValue;
    }
  });
}

function temperature_check(device_id) {
  //  open window to decrease temperature  //

	if (dev[device_id]["temperature"] >= dev[device_id]["target"] + 3) {
    dev[device_id]["window"] = true;
  }

	if (dev[device_id]["temperature"] <= dev[device_id]["target"] - 3) {
    dev[device_id]["window"] = false;
  }
}
