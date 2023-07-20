import { Go1, Go1Mode } from "@droneblocks/go1-js"

let dog = new Go1();
dog.init();

async function blinkLed() {
    // set the LED to blue
    dog.setLedColor(0, 0, 255);

    // blink the LED 3 times
    for (let i = 0; i < 3; i++) {
        // wait for 3 seconds
        await dog.wait(2000);

        // set the LED to green
        dog.setLedColor(0, 255, 0);

        // wait for 500 milliseconds
        await dog.wait(2000);

        // set the LED to blue
        dog.setLedColor(0, 0, 255);

        console.log(`loop ${i}`)
    }

    await dog.wait(2000);

    console.log('turn led off');

    // set the LED to off
    dog.setLedColor(0, 0, 0);

}

// call the blinkLed function to start the blinking
blinkLed();