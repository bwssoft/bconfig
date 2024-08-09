const auto_test_hints = {
  SIMHW: "Check if sim card is insert correctly on the holder (SIM1) or these components R27, C3, C6, C7, C8 are soldering correctly.",
  GPS: "Check the GPS circuit (G1), pin 8 (VCC), pin 9(Reset),  pin 2(TX uart signal) with scope, check level translator (IC4) if there is signal in pin 6 and pin 3 (TX uart signal).",
  IN1: "Check the IN1 circuit, R12, D8 (polarity), C38, IC2 (pin 5 and pin 3).",
  IN2: "Check the IN21 circuit, R29, D3 (polarity), R28, C16.",
  OUT: "Check the out circuit R33, R22, R32, Q6, Q2, D22 (polarity), D13 (polarity), R19.",
  ACEL: "Check the IC9 circuit, R23 e R24 (pull up on the i2c bus), pin5 (interrupt pin) and pin1, pin10, pin 3, pin7 (1.8V).",
  CHARGER: "Check the IC8 circuit, R8, Q3, R6, IC8, C32, C33, C34.",
  VCC: "Check the ADC circuit R14 and R15, SW1 (analog switch) pin 1 and pin 4 checking with multimeter the power less than 1V.",
  MEM: "Check the IC1 circuit, pin 8, pin 7, pin 3 (1.8V), R26, check signals using scope pin1 (SPI CS signal), pin 2(SPI MISO signal), pin 5(SPI MOSI), pin 6 (SPI CLK)."
}

export const E34G_constants = {
  auto_test_hints
}