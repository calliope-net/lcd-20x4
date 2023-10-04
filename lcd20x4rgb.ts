
namespace lcd20x4
/*
*/ {
    const SETTING_COMMAND = 0x7C // 124, |, the pipe character: The command to change settings: baud, lines, width, backlight, splash, etc


    //% group="Backlight" subcategory="RGB Backlight"
    //% block="i2c %pADDR set RGB rot %r grün %g blau %b" weight=4
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
        pins.i2cWriteBuffer(pADDR, bu)
        control.waitMicros(50000) // 0.05 Sekunden
        //sleep(0.05)
    }

    //% group="Backlight" subcategory="RGB Backlight"
    //% block="i2c %pADDR set RGB %color" weight=1
    //% pADDR.shadow="lcd16x2rgb_eADDR"
    //% color.shadow="colorNumberPicker"
    export function setRGB1(pADDR: number, color: number) {
        setBacklight(pADDR, color >>> 16 & 0xFF, color >>> 8 & 0xFF, color & 0xFF)
    }

} // lcd20x4rgb.ts
