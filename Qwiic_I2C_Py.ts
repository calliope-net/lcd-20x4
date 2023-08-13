
// https://github.com/sparkfun/Qwiic_I2C_Py/blob/master/qwiic_i2c/circuitpy_i2c.py

namespace Qwiic_I2C_Py {

    //--------------------------------------------------------------------------	
    // write Data Commands 
    //
    // Send a command to the I2C bus for this device. 
    //
    // value = 16 bits of valid data..
    //

    export function writeCommand(address: number, commandCode: number) {
        /*
            Called to write a command to a device. No actual data is written

            :param address: The I2C address of the device to read from
            :param commandCode: The "command" or register to read from

            :return: None
        */
        let bu = pins.createBuffer(1)
        bu.setUint8(0, commandCode)
        writeto(address, bu, true) // stop=True
    }

    export function writeWord(address: number, commandCode: number, value: number) {
        /*
             Called to write a word (16 bits) to a device.
 
             :param address: The I2C address of the device to read from
             :param commandCode: The "command" or register to read from
             :param value: The word (16 bits) to write to the I2C bus
 
             :return: None
        */
        let bu = pins.createBuffer(1)
        bu.setUint8(0, commandCode)
        writeto(address, bu, false) // stop=False

        bu = pins.createBuffer(2)
        bu.setUint8(0, value & 0xFF)
        bu.setUint8(0, (value >> 8) & 0xFF)
        writeto(address, bu, true) // stop=True
    }

    export function writeByte(address: number, commandCode: number, value: number) {
        /*
            Called to write a byte (8 bits) to a device.

            :param address: The I2C address of the device to read from
            :param commandCode: The "command" or register to read from
            :param value: The byte (8 bits) to write to the I2C bus

            :return: None
        */
        let bu = pins.createBuffer(1)
        bu.setUint8(0, commandCode)
        writeto(address, bu, false) // stop=False

        bu = pins.createBuffer(1)
        bu.setUint8(0, value)
        writeto(address, bu, true) // stop=True
    }

    export function writeBlock(address: number, commandCode: number, value: Buffer) {
        /*
            Called to write a block of bytes to a device.

            :param address: The I2C address of the device to read from
            :param commandCode: The "command" or register to read from
            :param value: A list of bytes (ints) to write on the I2C bus.

            :return: None
        */
        let bu = pins.createBuffer(1)
        bu.setUint8(0, commandCode)
        writeto(address, bu, false) // stop=False

        writeto(address, value, true) // stop=True
    }

    // self.i2cbus.writeto
    function writeto(address: number, data: Buffer, stop: boolean) {
        // https://github.com/sparkfun/Qwiic_I2C_Py/blob/master/qwiic_i2c/circuitpy_i2c.py
        pins.i2cWriteBuffer(address, data, !stop) // repeat? False = NOT stop True
        // self.i2cbus.writeto(address, data, stop=True)
        // data kann ein Byte oder ein ByteArray=Buffer sein
    }


} // Qwiic_I2C_Py.ts
