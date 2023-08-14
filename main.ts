input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    lcd20x4.writeText(lcd20x4.eADDR.LCD_Qwiic, 2, 11, 19, lcd20x4.eAlign.left, "lcd-20x4")
})
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
    lcd20x4.settingCommand_4(lcd20x4.eADDR.LCD_Qwiic, 255, 255, 255)
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    lcd20x4.setBacklight(lcd20x4.eADDR.LCD_Qwiic, 255, 134, 86)
})
lcd20x4.initLCD(lcd20x4.eADDR.LCD_Qwiic)
