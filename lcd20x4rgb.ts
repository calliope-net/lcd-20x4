
namespace lcd20x4
/*
*/ {
    const SETTING_COMMAND = 0x7C // 124, |, the pipe character: The command to change settings: baud, lines, width, backlight, splash, etc


    //% group="Display Hintergrundfarbe" subcategory="RGB Backlight"
    //% block="i2c %pADDR set RGB rot %r grün %g blau %b" weight=4
    //% pADDR.shadow="lcd20x4_eADDR"
    //% r.min=0 r.max=255 g.min=0 g.max=255 b.min=0 b.max=255
    //% r.defl=255 g.defl=255 b.defl=255
    //% inlineInputMode=inline
    export function settingCommand_4(pADDR: number, r: number, g: number, b: number) {
        /*
            Set backlight with no LCD messages or delays
            :param r: red backlight value 0-255
            :param g: green backlight value 0-255
            :param b: blue backlight value 0-255
        */
        let bu = Buffer.create(5)
        bu.setUint8(0, SETTING_COMMAND)
        bu.setUint8(1, eSETTING_COMMAND_4.SET_RGB_COMMAND)
        bu.setUint8(2, r)
        bu.setUint8(3, g)
        bu.setUint8(4, b)
        i2cWriteBuffer(pADDR, bu)
        // send the complete bytes (address, settings command , rgb command , red byte, green byte, blue byte)
        // Qwiic_I2C_Py.writeBlock(pADDR, SETTING_COMMAND, bu)
        control.waitMicros(50000) // 0.05 Sekunden
        //sleep(0.01)
    }



    //% group="Display Hintergrundfarbe" subcategory="RGB Backlight"
    //% block="i2c %pADDR set RGB %color" weight=1
    //% pADDR.shadow="lcd20x4_eADDR"
    //% color.shadow="colorNumberPicker"
    export function setRGB(pADDR: number, color: number) {
        settingCommand_4(pADDR, color >>> 16 & 0xFF, color >>> 8 & 0xFF, color & 0xFF)
    }




    //% group="SETTING_COMMAND" subcategory="RGB Backlight"
    //% block="i2c %pADDR set RGB rot %r grün %g blau %b" weight=8
    //% pADDR.shadow="lcd20x4_eADDR"
    //% r.min=0 r.max=255 g.min=0 g.max=255 b.min=0 b.max=255
    //% inlineInputMode=inline
    export function setBacklight(pADDR: number, r: number, g: number, b: number) {
        // Turn display off to hide confirmation messages
        // _displayControl &= ~LCD_DISPLAYON

        let bu = Buffer.create(6)
        let off = 0
        // bu.setUint8(off++, SPECIAL_COMMAND)
        // bu.setUint8(off++, LCD_DISPLAYCONTROL | _displayControl)
        bu.setUint8(off++, SETTING_COMMAND)
        bu.setUint8(off++, 128 + Math.trunc(Math.map(r, 0, 255, 0, 29)))
        bu.setUint8(off++, SETTING_COMMAND)
        bu.setUint8(off++, 158 + Math.trunc(Math.map(g, 0, 255, 0, 29)))
        bu.setUint8(off++, SETTING_COMMAND)
        bu.setUint8(off++, 188 + Math.trunc(Math.map(b, 0, 255, 0, 29)))

        // Turn display back on and end
        // _displayControl |= LCD_DISPLAYON
        // bu.setUint8(off++, SPECIAL_COMMAND)
        // bu.setUint8(off++, LCD_DISPLAYCONTROL | _displayControl)

        // send the complete bytes (address, settings command , contrast command, contrast value)
        //Qwiic_I2C_Py.writeBlock(pADDR, SETTING_COMMAND, bu)
        i2cWriteBuffer(pADDR, bu)
        control.waitMicros(50000) // 0.05 Sekunden
        //sleep(0.05)
    }

} // lcd20x4rgb.ts
