
//% color=#0000FF icon="\uf26c" block="LCD 20x4" weight=16
namespace lcd20x4
/* 230814 \uf108
Calliope i2c Erweiterung für 'SparkFun Serial LCDs (QWIIC)'
optimiert und getestet für die gleichzeitige Nutzung mehrerer i2c Module am Calliope
[Projekt-URL] https://github.com/calliope-net/lcd-20x4
[README]      https://calliope-net.github.io/lcd-20x4

[Hardware]  https://www.sparkfun.com/products/16398 SparkFun 20x4 SerLCD - RGB Backlight (Qwiic)
            https://www.sparkfun.com/products/16397 SparkFun 16x2 SerLCD - RGB Text (Qwiic)
            https://www.sparkfun.com/products/16396 SparkFun 16x2 SerLCD - RGB Backlight (Qwiic)
JDH_1804_Datasheet https://www.sparkfun.com/datasheets/LCD/HD44780.pdf (ohne SETTING_COMMANDs)

[Software]  https://github.com/sparkfun/Qwiic_SerLCD_Py
            https://github.com/sparkfun/Qwiic_I2C_Py/tree/master/qwiic_i2c

i2c-Besonderheiten:
Ein COMMAND beginnt immer mit SPECIAL_COMMAND = 0xFE oder SETTING_COMMAND = '|'.
Diese Zeichen werden auch mitten im Text als COMMAND erkannt.
Deshalb werden sie (wie Umlaute und Sonderzeichen) durch druckbare Zeichen > 0xA0 ersetzt.
Bytes (COMMAND oder Text) können auf dem i2c-Bus einzeln oder zusammen übertragen werden.
Ein Buffer muss nicht mit einem COMMAND anfangen.
Jedes Byte wird angezeigt, wenn es nicht nach 0xFE oder | zu einem COMMAND gehört.

[Emergency Reset] https://learn.sparkfun.com/tutorials/avr-based-serial-enabled-lcds-hookup-guide/troubleshooting
When the screen first boots up, the AVR on the back will watch its RX pin. 
If that pin is held LOW (aka tied to ground), for 2 seconds, then it will reset all settings to default.

Code anhand der Python library und Datenblätter neu programmiert von Lutz Elßner im August 2023
*/ {
    export enum eADDR { LCD_20x4 = 0x72 } // This is the default address of the OpenLCD

    const MAX_ROWS = 4
    const MAX_COLUMNS = 20

    // OpenLCD command characters
    const SPECIAL_COMMAND = 254  // Magic number for sending a special command
    const SETTING_COMMAND = 0x7C // 124, |, the pipe character: The command to change settings: baud, lines, width, backlight, splash, etc


    // special commands
    // const LCD_CLEARDISPLAY = 0x01   // im Beispiel Py nicht benutzt, stattdessen CLEAR_COMMAND = 0x2D
    // const LCD_RETURNHOME = 0x02     // SPECIAL_COMMAND, LCD_RETURNHOME (1 Byte)
    // Flags
    const LCD_ENTRYMODESET = 0x04   // SPECIAL_COMMAND, LCD_ENTRYMODESET | Flags
    const LCD_DISPLAYCONTROL = 0x08 // SPECIAL_COMMAND, LCD_DISPLAYCONTROL | Flags
    const LCD_CURSORSHIFT = 0x10    // SPECIAL_COMMAND, LCD_CURSORSHIFT | Flags
    //    LCD_FUNCTIONSET = 0x20    nicht benutzt
    //    LCD_SETCGRAMADDR = 0x40   nicht benutzt
    // set Cursor
    const LCD_SETDDRAMADDR = 0x80   // SPECIAL_COMMAND, LCD_SETDDRAMADDR | (col + row_offsets[row])
    export enum eLCD_CLEARDISPLAY { LCD_CLEARDISPLAY = 0x01, LCD_RETURNHOME = 0x02 }

    // flags for display entry mode // SPECIAL_COMMAND + 1 Byte (4|2|1)
    // const LCD_ENTRYRIGHT = 0x00 // SPECIAL_COMMAND, Flags(LCD_ENTRYMODESET | LCD_ENTRYRIGHT | LCD_ENTRYSHIFTDECREMENT)
    // const LCD_ENTRYLEFT = 0x02
    // const LCD_ENTRYSHIFTINCREMENT = 0x01
    // const LCD_ENTRYSHIFTDECREMENT = 0x00
    export enum eLCD_ENTRYMODE { LCD_ENTRYLEFT = 0x02, LCD_ENTRYRIGHT = 0x00 }
    export enum eLCD_ENTRYSHIFT { LCD_ENTRYSHIFTDECREMENT = 0x00, LCD_ENTRYSHIFTINCREMENT = 0x01 }


    // flags for display on/off control (8 | 4 | 2 | 1)
    // const LCD_DISPLAYON = 0x04 // SPECIAL_COMMAND, Flags(LCD_DISPLAYCONTROL | LCD_DISPLAYON | )
    // const LCD_DISPLAYOFF = 0x00
    // const LCD_CURSORON = 0x02
    // const LCD_CURSOROFF = 0x00
    // const LCD_BLINKON = 0x01
    // const LCD_BLINKOFF = 0x00

    // flags for display/cursor shift (0x10 | 8 | 4)
    // const LCD_DISPLAYMOVE = 0x08 // SPECIAL_COMMAND, Flags(LCD_CURSORSHIFT | LCD_DISPLAYMOVE)
    // const LCD_CURSORMOVE = 0x00
    // const LCD_MOVERIGHT = 0x04
    // const LCD_MOVELEFT = 0x00
    export enum eLCD_DISPLAYMOVE { LCD_CURSORMOVE = 0x00, LCD_DISPLAYMOVE = 0x08 }
    export enum eLCD_MOVERIGHT { LCD_MOVERIGHT = 0x04, LCD_MOVELEFT = 0x00 }


    // Variablen
    // let _displayControl = LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF
    // let _displayMode = LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT

    // ========== special commands

    //% group="LCD Display Qwiic" advanced=true
    //% block="i2c %pADDR %pLCD_CLEARDISPLAY" weight=50
    export function clearScreen(pADDR: eADDR, pLCD_CLEARDISPLAY: eLCD_CLEARDISPLAY) {
        specialCommand(pADDR, pLCD_CLEARDISPLAY)
        // settingCommand_1(pADDR, eSETTING_COMMAND_1.CLEAR_COMMAND)
    }

    //% group="SPECIAL_COMMAND" advanced=true
    //% block="i2c %pADDR %pENTRYMODE %pENTRYSHIFT" weight=30
    export function entrymodeset(pADDR: eADDR, pENTRYMODE: eLCD_ENTRYMODE, pENTRYSHIFT: eLCD_ENTRYSHIFT) {
        // LCD_ENTRYLEFT Set the text to flow from left to right. This is the direction that is common to most Western languages.
        // LCD_ENTRYSHIFTINCREMENT Turn autoscrolling off.
        specialCommand(pADDR, LCD_ENTRYMODESET | pENTRYMODE | pENTRYSHIFT)
    } // 37 µs bei 270 kHz (gilt für alle außer LCD_RETURNHOME)

    export enum eONOFF { OFF = 0, ON = 1 }

    //% group="LCD Display Qwiic" advanced=true
    //% block="i2c %pADDR display %display cursor %cursor blink %blink" weight=52
    //% row.min=0 row.max=1 col.min=0 col.max=15 display.defl=lcd20x4.eONOFF.ON
    //% inlineInputMode=inline
    export function setDisplay(pADDR: eADDR, display: eONOFF, cursor: eONOFF, blink: eONOFF) {
        let command: number = LCD_DISPLAYCONTROL // 0x08
        if (display == eONOFF.ON) { command += 0x04 }
        if (cursor == eONOFF.ON) { command += 0x02 }
        if (blink == eONOFF.ON) { command += 0x01 }

        specialCommand(pADDR, command)
    }

    //% group="SPECIAL_COMMAND" advanced=true
    //% block="i2c %pADDR %pDISPLAYMOVE %pMOVERIGHT count %pCount" weight=32
    //% inlineInputMode=inline
    export function cursorshift(pADDR: eADDR, pDISPLAYMOVE: eLCD_DISPLAYMOVE, pMOVERIGHT: eLCD_MOVERIGHT, pCount: number) {
        let bu = pins.createBuffer(2 * Math.min(Math.max(0, pCount), MAX_COLUMNS - 1)) // pCount 0..15 oder 0..19
        for (let i = 0; i < bu.length; i += 2) {
            bu.setUint8(i, SPECIAL_COMMAND)
            bu.setUint8(i + 1, LCD_CURSORSHIFT | pDISPLAYMOVE | pMOVERIGHT)
        }
        pins.i2cWriteBuffer(pADDR, bu)
        sleep(0.05)
    }




    // ========== eigene Funktionen ==========
    // ========== group="LCD Display Qwiic"

    export enum eINIT { _ = 0, RGB_CONTRAST = 1 }

    //% group="LCD Display Qwiic"
    //% block="i2c %pADDR init LCD %pSettings" weight=86
    export function initLCD(pADDR: eADDR, pSettings: eINIT) {
        // LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF // 0x0C
        setDisplay(pADDR, eONOFF.ON, eONOFF.OFF, eONOFF.OFF)
        // LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT // 0x06
        entrymodeset(pADDR, eLCD_ENTRYMODE.LCD_ENTRYLEFT, eLCD_ENTRYSHIFT.LCD_ENTRYSHIFTDECREMENT)
        if (pSettings == eINIT.RGB_CONTRAST) {
            // RGB white
            setBacklight(pADDR, 255, 255, 255)
            // CONTRAST_COMMAND
            settingCommand_2(pADDR, eSETTING_COMMAND_2.CONTRAST_COMMAND, 0)
        }
        // LCD_CLEARDISPLAY
        clearScreen(pADDR, eLCD_CLEARDISPLAY.LCD_CLEARDISPLAY)
    }

    export enum eAlign { left, right }

    //% group="LCD Display Qwiic"
    //% block="i2c %pADDR writeText row %row col %col end %end align %pFormat Text %pText" weight=84
    //% row.min=0 row.max=3 col.min=0 col.max=19 end.min=0 end.max=19 end.defl=19
    //% inlineInputMode=inline
    export function writeText(pADDR: eADDR, row: number, col: number, end: number, pAlign: eAlign, pText: string) {
        let l: number = end - col + 1, t: string
        if (col >= 0 && col <= MAX_COLUMNS - 1 && l > 0 && l <= MAX_COLUMNS) {
            setCursor(pADDR, row, col)

            if (pText.length >= l) t = pText.substr(0, l)
            else if (pText.length < l && pAlign == eAlign.left) { t = pText + "                    ".substr(0, l - pText.length) }
            else if (pText.length < l && pAlign == eAlign.right) { t = "                    ".substr(0, l - pText.length) + pText }

            writeLCD(pADDR, t)
        }
    }


    //% group="LCD Display Qwiic"
    //% block="i2c %pADDR setCursor row %pRow col %pCol" weight=82
    //% row.min=0 row.max=3 col.min=0 col.max=19
    export function setCursor(pADDR: eADDR, pRow: number, pCol: number) {
        let row_offsets = [0x00, 0x40, 0x14, 0x54] // 0, 64, 20, 84
        // kepp variables in bounds
        // pRow = Math.max(0, pRow)            //row cannot be less than 0
        pRow = Math.min(Math.max(0, pRow), MAX_ROWS - 1) //row cannot be greater than max rows
        pCol = Math.min(Math.max(0, pCol), MAX_COLUMNS - 1)
        specialCommand(pADDR, LCD_SETDDRAMADDR | (row_offsets[pRow] + pCol)) // max. 7 Bit (127)
        /* specialCommand(pADDR, LCD_SETDDRAMADDR |
            (
                Math.min(Math.max(0, pCol), MAX_COLUMNS - 1) // pCol 0..15 oder 0..19
                + row_offsets[pRow & (MAX_ROWS - 1)]) // pRow & 0x03 oder 0x01 -> [index] 0,1 oder 0,1,2,3
        ) */

        // construct the cursor "command"
        //let command = LCD_SETDDRAMADDR | (pCol + row_offsets[pRow & (MAX_ROWS - 1)])
        //Qwiic_I2C_Py.writeByte(pADDR, SPECIAL_COMMAND, command)
    }

    //% group="LCD Display Qwiic"
    //% block="i2c %pADDR writeText %pString" weight=80
    export function writeLCD(pADDR: eADDR, pString: string) {
        //for (let val in pString) {}

        let bu = pins.createBuffer(pString.length)
        for (let i = 0; i < pString.length; i++) {
            bu.setUint8(i, changeCharCode(pString.charAt(i)))
        }
        pins.i2cWriteBuffer(pADDR, bu)
        sleep(0.01)
    }

    // ========== advanced=true
    // ========== group="LCD Display Qwiic"



    //% group="LCD Display Qwiic" advanced=true
    //% block="i2c %pADDR setCursor row %row col %col cursor %cursor blink %blink" weight=54
    //% row.min=0 row.max=3 col.min=0 col.max=19 cursor.defl=lcd20x4.eONOFF.ON
    //% inlineInputMode=inline
    export function setCursorCB(pADDR: eADDR, row: number, col: number, cursor: eONOFF, blink: eONOFF) {
        setCursor(pADDR, row, col)
        setDisplay(pADDR, eONOFF.ON, cursor, blink)
    }




    // ========== group="SETTING_COMMAND" advanced=true ========== im Datasheet nicht dokumentiert


    // OpenLCD commands
    // const CLEAR_COMMAND = 0x2D					// 45, -, the dash character: command to clear and home the display
    // const CONTRAST_COMMAND = 0x18				// Command to change the contrast setting
    // const ADDRESS_COMMAND = 0x19				    // Command to change the i2c address
    // const SET_RGB_COMMAND = 0x2B				    // 43, +, the plus character: command to set backlight RGB value
    // const ENABLE_SYSTEM_MESSAGE_DISPLAY = 0x2E   // 46, ., command to enable system messages being displayed
    // const DISABLE_SYSTEM_MESSAGE_DISPLAY = 0x2F  // 47, /, command to disable system messages being displayed
    // const ENABLE_SPLASH_DISPLAY = 0x30			// 48, 0, command to enable splash screen at power on
    // const DISABLE_SPLASH_DISPLAY = 0x31			// 49, 1, command to disable splash screen at power on
    // const SAVE_CURRENT_DISPLAY_AS_SPLASH = 0x0A  // 10, Ctrl+j, command to save current text on display as splash

    export enum eSETTING_COMMAND_1 {    // SETTING_COMMAND + 1 Byte
        CLEAR_COMMAND = 0x2D,                   // SETTING_COMMAND, CLEAR_COMMAND
        ENABLE_SYSTEM_MESSAGE_DISPLAY = 0x2E,   // SETTING_COMMAND, ENABLE_SYSTEM_MESSAGE_DISPLAY
        DISABLE_SYSTEM_MESSAGE_DISPLAY = 0x2F,  // SETTING_COMMAND, DISABLE_SYSTEM_MESSAGE_DISPLAY
        ENABLE_SPLASH_DISPLAY = 0x30,           // SETTING_COMMAND, ENABLE_SPLASH_DISPLAY
        DISABLE_SPLASH_DISPLAY = 0x31,          // SETTING_COMMAND, DISABLE_SPLASH_DISPLAY
        SAVE_CURRENT_DISPLAY_AS_SPLASH = 0x0A   // SETTING_COMMAND, SAVE_CURRENT_DISPLAY_AS_SPLASH
    }
    export enum eSETTING_COMMAND_2 {    // SETTING_COMMAND + 2 Byte
        CONTRAST_COMMAND = 0x18,        // SETTING_COMMAND, CONTRAST_COMMAND, value
        ADDRESS_COMMAND = 0x19,         // SETTING_COMMAND, ADDRESS_COMMAND, value
    }
    export enum eSETTING_COMMAND_4 {    // SETTING_COMMAND + 4 Byte
        SET_RGB_COMMAND = 0x2B          // SETTING_COMMAND, SET_RGB_COMMAND, r, g, b
    }

    //% group="SETTING_COMMAND" advanced=true
    //% block="i2c %pADDR SETTING_COMMAND %pCommand" weight=24
    export function settingCommand_1(pADDR: eADDR, pCommand: eSETTING_COMMAND_1) {
        //command(pADDR, pCommand) // (0) SETTING_COMMAND, (1) pCommand
        let bu = pins.createBuffer(2)
        bu.setUint8(0, SETTING_COMMAND)
        bu.setUint8(1, pCommand)
        pins.i2cWriteBuffer(pADDR, bu)

        //Qwiic_I2C_Py.writeByte(pADDR, SETTING_COMMAND, pCommand)
        sleep(0.01)
    }

    //% group="SETTING_COMMAND" advanced=true
    //% block="i2c %pADDR SETTING_COMMAND %pCommand %pByte" weight=22
    //% pByte.min=0 pByte.max=255
    export function settingCommand_2(pADDR: eADDR, pCommand: eSETTING_COMMAND_2, pByte: number) {
        /*
            # To set the contrast we need to send 3 bytes:
            # (1) SETTINGS_COMMAND
            # (2) CONTRAST_COMMAND
            # (3) contrast value
            #
            # To do this, we are going to use writeBlock(),
            # so we need our "block of bytes" to include
            # CONTRAST_COMMAND and contrast value
        */
        let bu = pins.createBuffer(3)
        bu.setUint8(0, SETTING_COMMAND)
        bu.setUint8(1, pCommand)
        bu.setUint8(2, pByte & 0xFF)
        pins.i2cWriteBuffer(pADDR, bu)

        //Qwiic_I2C_Py.writeByte(pADDR, SETTING_COMMAND, pCommand)
        sleep(0.05)
    }

    //% group="RGB Backlight"
    //% block="i2c %pADDR set RGB r %r g %g b %b" weight=70
    //% r.min=0 r.max=255 g.min=0 g.max=255 b.min=0 b.max=255
    //% r.defl=255 g.defl=255 b.defl=255
    //% inlineInputMode=inline
    export function settingCommand_4(pADDR: eADDR, r: number, g: number, b: number) {
        /*
            Set backlight with no LCD messages or delays
            :param r: red backlight value 0-255
            :param g: green backlight value 0-255
            :param b: blue backlight value 0-255
        */
        let bu = pins.createBuffer(5)
        bu.setUint8(0, SETTING_COMMAND)
        bu.setUint8(1, eSETTING_COMMAND_4.SET_RGB_COMMAND)
        bu.setUint8(2, r)
        bu.setUint8(3, g)
        bu.setUint8(4, b)
        pins.i2cWriteBuffer(pADDR, bu)
        // send the complete bytes (address, settings command , rgb command , red byte, green byte, blue byte)
        // Qwiic_I2C_Py.writeBlock(pADDR, SETTING_COMMAND, bu)
        sleep(0.01)
    }


    // ========== group="SETTING_COMMAND" advanced=true ========== im Datasheet nicht dokumentiert

    //% group="SETTING_COMMAND" advanced=true
    //% block="i2c %i2cADDR set RGB r %r g %g b %b" weight=20
    //% r.min=0 r.max=255 g.min=0 g.max=255 b.min=0 b.max=255
    //% inlineInputMode=inline
    export function setBacklight(pADDR: eADDR, r: number, g: number, b: number) {
        // Turn display off to hide confirmation messages
        // _displayControl &= ~LCD_DISPLAYON

        let bu = pins.createBuffer(6)
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
        sleep(0.05)
    }


    // ========== group="Text" advanced=true

    //% group="Text" advanced=true
    //% block="Sonderzeichen Code von Char %pChar" weight=10
    export function changeCharCode(pChar: string) {
        if (pChar.length == 0) return 0
        switch (pChar.charCodeAt(0)) {
            case SPECIAL_COMMAND: return 0xD8 // 0xFE im Text wirkt als Command, auch
            case SETTING_COMMAND: return 0xC9 // '|'  wenn es nicht am Anfang im Buffer steht
            case 0x0D: return 0xA2 // CR durch druckbares Zeichen aus LCD Font-Table ersetzen
            case 0x0A: return 0xA3 // LF
            case 0xFF: return 0xF3 // EOF
            case 0x00: return 0xF2 // NUL
            case 0x80: return 0xE3 // € kann verschiedene Codierungen haben
        }
        switch (pChar.charAt(0)) { // case "ä", "Ä" mit Komma trennen funktioniert nicht
            case "ß": return 0xE2
            case "ä": return 0xE1
            case "ö": return 0xEF
            case "ü": return 0xF5
            case "Ä": return 0xE1
            case "Ö": return 0xEF
            case "Ü": return 0xF5
            case "€": return 0xE3 // € funktioniert nicht
            case "µ": return 0xE4
            case "°": return 0xDF
        }
        return pChar.charCodeAt(0) & 0xFF // es können nur 1 Byte Zeichen-Codes im Buffer übertragen werden
    }



    // ========== PRIVATE function

    // aus Python
    function sleep(pSekunden: number) { control.waitMicros(pSekunden * 1000000) }

    function specialCommand(pADDR: eADDR, pCommand: number) {
        let bu = pins.createBuffer(2)
        bu.setUint8(0, SPECIAL_COMMAND)
        bu.setUint8(1, pCommand & 0xFF)
        pins.i2cWriteBuffer(pADDR, bu)

        //Qwiic_I2C_Py.writeByte(pADDR, SPECIAL_COMMAND, pCommand)
        sleep(0.05)
    }

} // lcd-20x4.ts
