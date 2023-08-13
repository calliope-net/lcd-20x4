input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    lcd20x4.print(lcd20x4.eADDR.LCD_Qwiic, "Abc | @#*")
})
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
    lcd20x4.setBacklight(lcd20x4.eADDR.LCD_Qwiic, 255, 16, 240)
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    lcd20x4.print(lcd20x4.eADDR.LCD_Qwiic, "Hallo" + String.fromCharCode(254) + "@ß~")
})
lcd20x4.begin(lcd20x4.eADDR.LCD_Qwiic)
lcd20x4.setCursor(lcd20x4.eADDR.LCD_Qwiic, 1, 0)
lcd20x4.print(lcd20x4.eADDR.LCD_Qwiic, "Hallo Hallo Hallo Hallo Hallo")
