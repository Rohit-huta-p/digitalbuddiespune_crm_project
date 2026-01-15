package com.crm.utility;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class SalaryUtil {

    public static double convertHourlyToMinuteSalary(double hourlySalary) {
        return hourlySalary / 60; // 1 hour = 60 minutes
    }
    
    public static double calculateOvertimeSalary(double overtimeMinutes, double perMinuteSalary) {
        return overtimeMinutes * perMinuteSalary * 1.5; // Overtime paid 1.5x
    }
    
    public static double convertMonthlyToHourlySalary(double monthlySalary) {
        return monthlySalary / (8 * 22); // Monthly salary divided by total working hours in a month
    }

}
