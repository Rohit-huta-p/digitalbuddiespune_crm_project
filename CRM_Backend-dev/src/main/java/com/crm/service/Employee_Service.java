package com.crm.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.crm.controller.Keys;
import com.crm.exception.DuplicateResourceException;
import com.crm.exception.ForBiddenException;
import com.crm.exception.InvalidCredentialsException;

import com.crm.exception.NotFoundException;
import com.crm.model.Employee;
import com.crm.model.EmployeeSalary;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.EmployeeSalaryRepositary;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;
import com.crm.utility.SalaryUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class Employee_Service {

    @Autowired
    private EmployeeRepo repo;

    @Autowired
    private EmployeeSalaryRepositary employeeSalaryRepositary;

    @Autowired
    private JwtBasedCurrentUserProvider basedCurrentUserProvider;

    public static final Logger LOG = LogManager.getLogger();

    // ✅ Allowed designations
    private static final List<String> ALLOWED_DESIGNATIONS = List.of(
            "Frontend Dev",
            "Backend Dev",
            "Fullstack Dev",
            "DevOps",
            "QA"
    );

    // ---------------- CREATE EMPLOYEE ----------------
    public Employee createEmployee(Map<String, ?> employeeData) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        try {
            Long requestCompanyId = Long.parseLong(employeeData.get(Constants.COMPANY_ID).toString());
            if (companyId != requestCompanyId) {
                throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
            }

            Employee employee = new Employee();
            employee.setName(employeeData.get(Keys.NAME).toString());
            employee.setEmail(employeeData.get(Keys.EMAIL).toString());
            employee.setMobile(employeeData.get(Keys.MOBILE).toString());
            employee.setRole(Integer.parseInt(employeeData.get(Keys.ROLE).toString()));
            employee.setPassword(employeeData.get(Keys.PASSWORD).toString());
            employee.setCompanyId(requestCompanyId);

            Long hrId = employeeData.containsKey(Keys.HRID) ? Long.parseLong(employeeData.get(Keys.HRID).toString()) : null;
            if (hrId != null) {
                Optional<Employee> emp = repo.findById(hrId);
                if (emp.isPresent() && emp.get().getRole() != 2) {
                    throw new ForBiddenException("Enter valid hr id which has role hr");
                }
            }
            employee.setHrId(hrId);

            // ✅ Validate and set designation
            if (!employeeData.containsKey(Keys.DESIGNATION) || employeeData.get(Keys.DESIGNATION) == null) {
                throw new InvalidCredentialsException("Designation is required.");
            }
            String designationInput = employeeData.get(Keys.DESIGNATION).toString().trim();
            if (!ALLOWED_DESIGNATIONS.contains(designationInput) && !designationInput.startsWith("Custom:")) {
                throw new InvalidCredentialsException(
                        "Invalid designation. Allowed values: " + ALLOWED_DESIGNATIONS + " or use 'Custom:YourDesignation'");
            }
            employee.setDesignation(designationInput);

            Employee savedEmployee = repo.save(employee);
            Long employeeId = savedEmployee.getId();

            double monthlySalary = Double.parseDouble(employeeData.get(Constants.MONTHLY_SALARY).toString());
            double hourlySalary = SalaryUtil.convertMonthlyToHourlySalary(monthlySalary);

            EmployeeSalary salary = new EmployeeSalary();
            salary.setEmployeeId(employeeId);
            salary.setMonthlySalary(monthlySalary);
            salary.setHourlySalary(hourlySalary);

            employeeSalaryRepositary.save(salary);

            return savedEmployee;

        } catch (DataIntegrityViolationException e) {
            throw new DuplicateResourceException(
                    "Employee with the same email, mobile, or employee ID already exists.");
        }
    }

    // ---------------- UPDATE EMPLOYEE ----------------
    public Employee updateEmployee(long id, Map<String, ?> employeeData) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(employeeData.get(Constants.COMPANY_ID).toString());
        if (companyId != requestCompanyId) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Employee existingEmployee = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        employeeData.forEach((key, value) -> {
            if (value != null) {
                switch (key) {
                    case Keys.NAME:
                        existingEmployee.setName(value.toString());
                        break;
                    case Keys.EMAIL:
                        existingEmployee.setEmail(value.toString());
                        break;
                    case Keys.MOBILE:
                        existingEmployee.setMobile(value.toString());
                        break;
                    case Keys.ROLE:
                        existingEmployee.setRole(Integer.parseInt(value.toString()));
                        break;
                    case Keys.PASSWORD:
                        existingEmployee.setPassword(value.toString());
                        break;
                    case Keys.HRID:
                        existingEmployee.setHrId(Long.parseLong(value.toString()));
                        break;
                    case Constants.COMPANY_ID:
                        existingEmployee.setCompanyId(Long.parseLong(value.toString()));
                        break;
                    case Keys.DESIGNATION:
                        String designationInput = value.toString().trim();
                        if (!ALLOWED_DESIGNATIONS.contains(designationInput) && !designationInput.startsWith("Custom:")) {
                            throw new InvalidCredentialsException(
                                    "Invalid designation. Allowed values: " + ALLOWED_DESIGNATIONS + " or use 'Custom:YourDesignation'");
                        }
                        existingEmployee.setDesignation(designationInput);
                        break;
                }
            }
        });

        // Update monthly salary if provided
        if (employeeData.containsKey(Constants.MONTHLY_SALARY) && employeeData.get(Constants.MONTHLY_SALARY) != null) {
            double monthlySalary = Double.parseDouble(employeeData.get(Constants.MONTHLY_SALARY).toString());
            double hourlySalary = SalaryUtil.convertMonthlyToHourlySalary(monthlySalary);

            EmployeeSalary salary = employeeSalaryRepositary.findByEmployeeId(id)
                    .orElse(new EmployeeSalary());

            salary.setEmployeeId(id);
            salary.setMonthlySalary(monthlySalary);
            salary.setHourlySalary(hourlySalary);

            employeeSalaryRepositary.save(salary);
        }

        return repo.save(existingEmployee);
    }

    // ---------------- OTHER METHODS ----------------
    public Employee getEmployeeById(long id, Long requestCompanyId) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        if (companyId != requestCompanyId) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Employee not found with id: " + id));
    }

    public List<Employee> getAllEmployee(Map<String, ?> request) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());
        if (companyId != requestCompanyId) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        List<Employee> employees = repo.findByCompanyId(requestCompanyId);
        if (employees.isEmpty()) {
            throw new NotFoundException("No employees found in the database.");
        }
        return employees;
    }

    public void deleteEmployee(long id, Long requestCompanyId) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        if (companyId != requestCompanyId) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        if (repo.existsById(id)) {
            repo.deleteById(id);
        } else {
            throw new NotFoundException("Employee not found with id: " + id);
        }
    }

    public Employee authenticateEmployee(String employeeId, String password) {
        LOG.info("Authenticating employee with ID: " + employeeId);

        Employee employee = repo.findByEmployeeId(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee with ID " + employeeId + " not found."));

        if (!employee.getPassword().equals(password)) {
            throw new InvalidCredentialsException("Invalid employee ID or password.");
        }

        return employee;
    }

    public Employee findEmployeeByEmployeeId(String employeeId) {
        return repo.findByEmployeeId(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with Employee ID: " + employeeId));
    }

    public List<Map<String, Object>> searchEmployeeByNameOrPhone(String name, String phone) {

        List<Employee> employees;

        if (name != null && !name.isEmpty()) {
            employees = repo.findByNameContainingIgnoreCase(name);
        } else if (phone != null && !phone.isEmpty()) {
            employees = repo.findByMobile(phone);
        } else {
            throw new NotFoundException("No search parameters provided.");
        }

        if (employees.isEmpty()) {
            throw new NotFoundException("No employees found for the given name or phone number.");
        }

        List<Map<String, Object>> employeeList = new ArrayList<>();
        for (Employee employee : employees) {
            Map<String, Object> employeeData = new HashMap<>();
            employeeData.put("id", employee.getId());
            employeeData.put("name", employee.getName());
            employeeList.add(employeeData);
        }

        return employeeList;
    }

}
