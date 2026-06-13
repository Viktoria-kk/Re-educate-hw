#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program.argument("<city>").action(async (city) => {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=895284fb2d2c50a520ea537456963d9c`,
    );

    const data = await res.json();

    console.log(`City: ${data.name}`);
    console.log(`Temp: ${data.main.temp}°C`);
    console.log(`Feels like: ${data.main.feels_like}°C`);
    console.log(`Weather: ${data.weather[0].main}`);
  } catch (err) {
    console.log("Error: city not found");
  }
});

program.parse();
