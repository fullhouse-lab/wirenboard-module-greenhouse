var greenhouse = require("greenhouse");

greenhouse.start({
	id: "greenhouse_1",
	title: "Greenhouse 1",
  temperature: 	{ device: "wb-m1w2_50",  control: "External Sensor 1" },
  window: 			{ device: "wb-mrps6_65", control: "K1" }
});

greenhouse.start({
	id: "greenhouse_2",
	title: "Greenhouse 2",
  temperature: 	{ device: "wb-m1w2_165", control: "External Sensor 1" },
  window: 			{ device: "wb-mrps6_65", control: "K2" }
});
