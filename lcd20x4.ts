
//% color=#BF003F icon="\uf26c" block="LCD 20x4" weight=16
namespace lcd20x4
/* 230815 231007 https://github.com/calliope-net/lcd-20x4
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
    let n_i2cCheck: boolean = false // i2c-Check
    let n_i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

    //const MAX_ROWS = 4
    //const MAX_COLUMNS = 20

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

    // flags for display entry mode // SPECIAL_COMMAND + 1 Byte (4|2|1)
    // const LCD_ENTRYRIGHT = 0x00 // SPECIAL_COMMAND, Flags(LCD_ENTRYMODESET | LCD_ENTRYRIGHT | LCD_ENTRYSHIFTDECREMENT)
    // const LCD_ENTRYLEFT = 0x02
    // const LCD_ENTRYSHIFTINCREMENT = 0x01
    // const LCD_ENTRYSHIFTDECREMENT = 0x00


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


    // Variablen
    // let _displayControl = LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF
    // let _displayMode = LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT


    // ========== group="LCD Display Qwiic"

    //% group="LCD Display Qwiic"
    //% block="i2c %pADDR beim Start || Reset RGB und CONTRAST %pSettings i2c-Check %ck" weight=6
    //% pADDR.shadow="lcd20x4_eADDR"
    //% pSettings.shadow="toggleOnOff" pSettings.defl=0
    //% ck.shadow="toggleOnOff" ck.defl=1
    export function initLCD(pADDR: number, pSettings?: boolean, ck?: boolean) {
        n_i2cCheck = (ck ? true : false) // optionaler boolean Parameter kann undefined sein
        n_i2cError = 0 // Reset Fehlercode

        // LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF // 0x0C
        setDisplay(pADDR, true, false, false)
        // LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT // 0x06
        entrymodeset(pADDR, eLCD_ENTRYMODE.LCD_ENTRYLEFT, eLCD_ENTRYSHIFT.LCD_ENTRYSHIFTDECREMENT)
        if (pSettings) {
            // RGB white
            setBacklight(pADDR, 255, 255, 255)
            // CONTRAST_COMMAND
            settingCommand_2(pADDR, eSETTING_COMMAND_2.CONTRAST_COMMAND, 0)
        }
        // LCD_CLEARDISPLAY
        clearScreen(pADDR, eLCD_CLEARDISPLAY.LCD_CLEARDISPLAY)
    }


    export enum eLCD_CLEARDISPLAY {
        //% block="Display löschen"
        LCD_CLEARDISPLAY = 0x01,
        //% block="Cursor Home"
        LCD_RETURNHOME = 0x02
    }

    //% group="LCD Display Qwiic"
    //% block="i2c %pADDR %pLCD_CLEARDISPLAY" weight=5
    //% pADDR.shadow="lcd20x4_eADDR"
    export function clearScreen(pADDR: number, pLCD_CLEARDISPLAY: eLCD_CLEARDISPLAY) {
        specialCommand(pADDR, pLCD_CLEARDISPLAY)
    }


    // ========== group="Text anzeigen"

    export enum eAlign {
        //% block="linksbündig"
        left,
        //% block="rechtsbündig"
        right
    }

    //% group="Text anzeigen"
    //% block="i2c %pADDR Text Zeile %row von %col bis %end %pText || %pAlign" weight=7
    //% pADDR.shadow="lcd20x4_eADDR"
    //% row.min=0 row.max=3 col.min=0 col.max=19 end.min=0 end.max=19 end.defl=19
    //% pText.shadow="lcd20x4_text"
    //% pAlign.defl=0
    //% inlineInputMode=inline
    export function writeText(pADDR: number, row: number, col: number, end: number, pText: any, pAlign?: eAlign) {
        let text: string = convertToText(pText)
        let len: number = end - col + 1
        //if (col >= 0 && col <= MAX_COLUMNS - 1 && len > 0 && len <= MAX_COLUMNS)
        if (between(row, 0, 3) && between(col, 0, 19) && between(len, 0, 20)) {
            setCursor(pADDR, row, col)

            if (text.length > len)
                text = text.substr(0, len)
            else if (text.length < len && pAlign == eAlign.right)
                text = "                    ".substr(0, len - text.length) + text
            else if (text.length < len)
                text = text + "                    ".substr(0, len - text.length)
            // else { } // Original Text text.length == len
            /* 
                        if (text.length >= len) t = text.substr(0, len)
                        else if (text.length < len && pAlign == eAlign.left) { t = text + "                    ".substr(0, len - text.length) }
                        else if (text.length < len && pAlign == eAlign.right) { t = "                    ".substr(0, len - text.length) + text }
             */
            writeLCD(pADDR, text)
        }
    }

    //% group="Text anzeigen"
    //% block="i2c %pADDR Cursor Zeile %row von %col" weight=6
    //% pADDR.shadow="lcd20x4_eADDR"
    //% row.min=0 row.max=3 col.min=0 col.max=19
    export function setCursor(pADDR: number, row: number, col: number) {
        /*         
                let row_offsets = [0x00, 0x40, 0x14, 0x54] // 0, 64, 20, 84
                // keep variables in bounds
                // pRow = Math.max(0, pRow)            //row cannot be less than 0
                row = Math.min(Math.max(0, row), 3) //row cannot be greater than max rows
                col = Math.min(Math.max(0, col), 19)
                specialCommand(pADDR, LCD_SETDDRAMADDR | (row_offsets[row] + col)) // max. 7 Bit (127)
         */
        if (between(row, 0, 3) && between(col, 0, 19)) {
            specialCommand(pADDR, LCD_SETDDRAMADDR | ([0x00, 0x40, 0x14, 0x54].get(row) + col)) // max. 7 Bit (127)
        }
    }

    //% group="Text anzeigen"
    //% block="i2c %pADDR Text %pText" weight=1
    //% pADDR.shadow="lcd20x4_eADDR"
    //% pText.shadow="lcd20x4_text"
    export function writeLCD(pADDR: number, pText: any) {
        let text: string = convertToText(pText)

        if (text.length > 32) {
            text = text.substr(0, 32)
        }
        let bu = Buffer.create(text.length)
        for (let i = 0; i < text.length; i++) {
            bu.setUint8(i, changeCharCode(text.charAt(i)))
        }
        i2cWriteBuffer(pADDR, bu)
        sleep(0.01)
    }


    // ========== group="Display"

    //export enum eONOFF { OFF = 0, ON = 1 }

    //% group="Display"
    //% block="i2c %pADDR Cursor Zeile %row von %col Cursor %cursor || Blink %blink" weight=4
    //% pADDR.shadow="lcd20x4_eADDR"
    //% row.min=0 row.max=3 col.min=0 col.max=19 cursor.defl=true blink.defl=false
    //% cursor.shadow="toggleOnOff" blink.shadow="toggleOnOff"
    //% inlineInputMode=inline
    export function setCursorCB(pADDR: number, row: number, col: number, cursor: boolean, blink?: boolean) {
        setCursor(pADDR, row, col)
        setDisplay(pADDR, true, cursor, blink)
    }

    //% group="Display"
    //% block="i2c %pADDR Display %display Cursor %cursor || Blink %blink" weight=2
    //% pADDR.shadow="lcd20x4_eADDR"
    //% display.defl=true blink.defl=false
    //% display.shadow="toggleOnOff" cursor.shadow="toggleOnOff" blink.shadow="toggleOnOff"
    //% inlineInputMode=inline
    export function setDisplay(pADDR: number, display: boolean, cursor: boolean, blink?: boolean) {
        let command: number = LCD_DISPLAYCONTROL // 0x08
        if (display) { command += 0x04 }
        if (cursor) { command += 0x02 }
        if (blink) { command += 0x01 }

        specialCommand(pADDR, command)
    }




    // ========== group="SPECIAL_COMMAND"


    export enum eLCD_ENTRYMODE { LCD_ENTRYLEFT = 0x02, LCD_ENTRYRIGHT = 0x00 }
    export enum eLCD_ENTRYSHIFT { LCD_ENTRYSHIFTDECREMENT = 0x00, LCD_ENTRYSHIFTINCREMENT = 0x01 }

    //% group="SPECIAL_COMMAND" advanced=true
    //% block="i2c %pADDR %pENTRYMODE %pENTRYSHIFT" weight=3
    //% pADDR.shadow="lcd20x4_eADDR"
    export function entrymodeset(pADDR: number, pENTRYMODE: eLCD_ENTRYMODE, pENTRYSHIFT: eLCD_ENTRYSHIFT) {
        // LCD_ENTRYLEFT Set the text to flow from left to right. This is the direction that is common to most Western languages.
        // LCD_ENTRYSHIFTINCREMENT Turn autoscrolling off.
        specialCommand(pADDR, LCD_ENTRYMODESET | pENTRYMODE | pENTRYSHIFT)
    } // 37 µs bei 270 kHz (gilt für alle außer LCD_RETURNHOME)


    export enum eLCD_DISPLAYMOVE { LCD_CURSORMOVE = 0x00, LCD_DISPLAYMOVE = 0x08 }
    export enum eLCD_MOVERIGHT { LCD_MOVERIGHT = 0x04, LCD_MOVELEFT = 0x00 }

    //% group="SPECIAL_COMMAND" advanced=true
    //% block="i2c %pADDR %pDISPLAYMOVE %pMOVERIGHT count %pCount" weight=2
    //% pADDR.shadow="lcd20x4_eADDR"
    //% pCount.min=0 pCount.max=19
    //% inlineInputMode=inline
    export function cursorshift(pADDR: number, pDISPLAYMOVE: eLCD_DISPLAYMOVE, pMOVERIGHT: eLCD_MOVERIGHT, pCount: number) {
        let bu = Buffer.create(2 * Math.min(Math.max(0, pCount), 19)) // pCount 0..15 oder 0..19
        for (let i = 0; i < bu.length; i += 2) {
            bu.setUint8(i, SPECIAL_COMMAND)
            bu.setUint8(i + 1, LCD_CURSORSHIFT | pDISPLAYMOVE | pMOVERIGHT)
        }
        i2cWriteBuffer(pADDR, bu)
        sleep(0.05)
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
    //% block="i2c %pADDR SETTING COMMAND 1 %pCommand" weight=4
    //% pADDR.shadow="lcd20x4_eADDR"
    export function settingCommand_1(pADDR: number, pCommand: eSETTING_COMMAND_1) {
        //command(pADDR, pCommand) // (0) SETTING_COMMAND, (1) pCommand
        let bu = Buffer.create(2)
        bu.setUint8(0, SETTING_COMMAND)
        bu.setUint8(1, pCommand)
        i2cWriteBuffer(pADDR, bu)

        //Qwiic_I2C_Py.writeByte(pADDR, SETTING_COMMAND, pCommand)
        sleep(0.01)
    }

    //% group="SETTING_COMMAND" advanced=true
    //% block="i2c %pADDR SETTING COMMAND 2 %pCommand %pByte" weight=2
    //% pADDR.shadow="lcd20x4_eADDR"
    //% pByte.min=0 pByte.max=255
    export function settingCommand_2(pADDR: number, pCommand: eSETTING_COMMAND_2, pByte: number) {
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
        let bu = Buffer.create(3)
        bu.setUint8(0, SETTING_COMMAND)
        bu.setUint8(1, pCommand)
        bu.setUint8(2, pByte & 0xFF)
        i2cWriteBuffer(pADDR, bu)

        //Qwiic_I2C_Py.writeByte(pADDR, SETTING_COMMAND, pCommand)
        sleep(0.05)
    }

    // ========== group="SETTING_COMMAND" advanced=true ========== im Datasheet nicht dokumentiert


    // ========== group="Text, Logik" advanced=true

    //% blockId=lcd20x4_text
    //% group="Text, Logik" advanced=true
    //% block="%s" weight=6
    export function lcd20x4_text(s: string): string { return s }

    //% group="Text, Logik" advanced=true
    //% block="Sonderzeichen Code von Char %pChar" weight=4
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

    //% group="Text, Logik" advanced=true
    //% block="%i0 zwischen %i1 und %i2" weight=2
    export function between(i0: number, i1: number, i2: number): boolean {
        return (i0 >= i1 && i0 <= i2)
    }


    // ========== PRIVATE function

    // aus Python
    function sleep(pSekunden: number) { control.waitMicros(pSekunden * 1000000) }

    function specialCommand(pADDR: number, pCommand: number) {
        let bu = Buffer.create(2)
        bu.setUint8(0, SPECIAL_COMMAND)
        bu.setUint8(1, pCommand & 0xFF)
        i2cWriteBuffer(pADDR, bu)

        //Qwiic_I2C_Py.writeByte(pADDR, SPECIAL_COMMAND, pCommand)
        sleep(0.05)
    }


    // ========== group="i2c Adressen"

    //% blockId=lcd20x4_eADDR
    //% group="i2c Adressen" advanced=true
    //% block="%pADDR" weight=4
    export function lcd20x4_eADDR(pADDR: eADDR): number { return pADDR }

    //% group="i2c Adressen" advanced=true
    //% block="i2c Fehlercode" weight=2
    export function i2cError() { return n_i2cError }

    export function i2cWriteBuffer(pADDR: number, buf: Buffer, repeat: boolean = false) { // export für lcd20x4rgb.ts
        if (n_i2cError == 0) { // vorher kein Fehler
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
            if (n_i2cCheck && n_i2cError != 0)  // vorher kein Fehler, wenn (n_i2cCheck=true): beim 1. Fehler anzeigen
                basic.showString(Buffer.fromArray([pADDR]).toHex()) // zeige fehlerhafte i2c-Adresse als HEX
        } else if (!n_i2cCheck)  // vorher Fehler, aber ignorieren (n_i2cCheck=false): i2c weiter versuchen
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
        //else { } // n_i2cCheck=true und n_i2cError != 0: weitere i2c Aufrufe blockieren
    }

    /*  wird beim LCD-Display nicht gebraucht
    function i2cReadBuffer(pADDR: number, size: number, repeat: boolean = false): Buffer {
        if (!n_i2cCheck || n_i2cError == 0)
            return pins.i2cReadBuffer(pADDR, size, repeat)
        else
            return Buffer.create(size)
    } */

} // lcd20x4.ts
