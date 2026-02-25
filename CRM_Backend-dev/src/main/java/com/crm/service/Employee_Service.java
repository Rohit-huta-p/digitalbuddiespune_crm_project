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
import com.crm.model.ProjectGroupDetails;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.EmployeeSalaryRepositary;
import com.crm.repos.ProjectGroupRepository;
import com.crm.repos.ProjectParticipantRepository;
import com.crm.repos.DailySalaryLogRepository;
import com.crm.repos.MonthlySalaryLogRepository;
import com.crm.repos.WorkTimeLocationLogRepository;
import com.crm.repos.OvertimeLogRepository;
import com.crm.repos.NotificationRepository;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;
import com.crm.utility.SalaryUtil;

import jakarta.transaction.Transactional;

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
    private ProjectGroupRepository projectGroupRepository;

    @Autowired
    private JwtBasedCurrentUserProvider basedCurrentUserProvider;

    @Autowired
    private ProjectParticipantRepository projectParticipantRepository;

    @Autowired
    private com.crm.repos.ClientDetailsRepository clientDetailsRepository;

    @Autowired
    private com.crm.repos.GroupChatRepository groupChatRepository;

    @Autowired
    private com.crm.repos.AttendanceRepository attendanceRepository;

    @Autowired
    private com.crm.repos.TaskManagementRepository taskRepository;

    @Autowired
    private com.crm.repos.SocialRepository socialRepository;

    @Autowired
    private com.crm.repos.BillRepository billRepository;

    @Autowired
    private com.crm.repos.LeadRepository leadRepository;

    @Autowired
    private DailySalaryLogRepository dailySalaryLogRepository;

    @Autowired
    private MonthlySalaryLogRepository monthlySalaryLogRepository;

    @Autowired
    private WorkTimeLocationLogRepository workTimeLocationLogRepository;

    @Autowired
    private OvertimeLogRepository overtimeLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public static final Logger LOG = LogManager.getLogger();

    // ✅ Allowed designations
    private static final List<String> ALLOWED_DESIGNATIONS = List.of(
            "Frontend Dev",
            "Backend Dev",
            "Fullstack Dev",
            "DevOps",
            "QA");

    // ---------------- CREATE EMPLOYEE ----------------
    public Employee createEmployee(Map<String, ?> employeeData) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();

        // Fallback for unauthenticated registrations (e.g. first admin)
        if (companyId == null && employeeData.containsKey(Constants.COMPANY_ID)
                && employeeData.get(Constants.COMPANY_ID) != null) {
            companyId = Long.parseLong(employeeData.get(Constants.COMPANY_ID).toString());
        } else if (companyId == null) {
            throw new ForBiddenException("Company ID must be provided for unauthenticated registration.");
        }

        try {
            Employee employee = new Employee();
            employee.setName(safelyGetString(employeeData, Keys.NAME));
            employee.setEmail(safelyGetString(employeeData, Keys.EMAIL));
            employee.setMobile(safelyGetString(employeeData, Keys.MOBILE));
            employee.setRole(Integer.parseInt(safelyGetString(employeeData, Keys.ROLE)));
            employee.setPassword(safelyGetString(employeeData, Keys.PASSWORD));
            employee.setCompanyId(companyId);

            Long hrId = (employeeData.containsKey(Keys.HRID) && employeeData.get(Keys.HRID) != null)
                    ? Long.parseLong(employeeData.get(Keys.HRID).toString())
                    : null;
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
                        "Invalid designation. Allowed values: " + ALLOWED_DESIGNATIONS
                                + " or use 'Custom:YourDesignation'");
            }
            employee.setDesignation(designationInput);

            Employee savedEmployee = repo.save(employee);
            Long employeeId = savedEmployee.getId();

            double monthlySalary = Double.parseDouble(safelyGetString(employeeData, Constants.MONTHLY_SALARY));
            double hourlySalary = SalaryUtil.convertMonthlyToHourlySalary(monthlySalary);

            double commissionRate = 0.0;
            if (employeeData.containsKey("commissionRate") && employeeData.get("commissionRate") != null) {
                commissionRate = Double.parseDouble(employeeData.get("commissionRate").toString());
            }

            EmployeeSalary salary = new EmployeeSalary();
            salary.setEmployeeId(employeeId);
            salary.setMonthlySalary(monthlySalary);
            salary.setHourlySalary(hourlySalary);
            salary.setCommissionRate(commissionRate);

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
                        if (!ALLOWED_DESIGNATIONS.contains(designationInput)
                                && !designationInput.startsWith("Custom:")) {
                            throw new InvalidCredentialsException(
                                    "Invalid designation. Allowed values: " + ALLOWED_DESIGNATIONS
                                            + " or use 'Custom:YourDesignation'");
                        }
                        existingEmployee.setDesignation(designationInput);
                        break;
                }
            }
        });

        // Update monthly salary or commission if provided
        boolean updateSalary = false;
        EmployeeSalary salary = employeeSalaryRepositary.findByEmployeeId(id).orElse(new EmployeeSalary());
        salary.setEmployeeId(id);

        if (employeeData.containsKey(Constants.MONTHLY_SALARY) && employeeData.get(Constants.MONTHLY_SALARY) != null) {
            double monthlySalary = Double.parseDouble(employeeData.get(Constants.MONTHLY_SALARY).toString());
            salary.setMonthlySalary(monthlySalary);
            salary.setHourlySalary(SalaryUtil.convertMonthlyToHourlySalary(monthlySalary));
            updateSalary = true;
        }

        if (employeeData.containsKey("commissionRate") && employeeData.get("commissionRate") != null) {
            salary.setCommissionRate(Double.parseDouble(employeeData.get("commissionRate").toString()));
            updateSalary = true;
        }

        if (updateSalary) {
            employeeSalaryRepositary.save(salary);
        }

        return repo.save(existingEmployee);
    }

    // ---------------- OTHER METHODS ----------------
    public Employee getEmployeeById(long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Employee not found with id: " + id));
    }

    public List<Employee> getAllEmployee(Map<String, ?> request) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();

        List<Employee> employees = repo.findByCompanyId(companyId);
        if (employees.isEmpty()) {
            throw new NotFoundException("No employees found in the database.");
        }
        return employees;
    }

    @Transactional
    public void deleteEmployee(long id) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();

        Employee employee = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + id));

        // Remove all project participation records for this employee
        projectParticipantRepository.deleteByEmployee(employee);

        // Remove employee from all tasks
        List<com.crm.model.Task> tasks = taskRepository.findByAssignedEmployeesContaining(employee);
        for (com.crm.model.Task task : tasks) {
            task.getAssignedEmployees().remove(employee);
            taskRepository.save(task);
        }

        // Remove employee from all group chats
        List<com.crm.model.GroupChat> groupChats = groupChatRepository.findByParticipantsContaining(employee);
        for (com.crm.model.GroupChat chat : groupChats) {
            chat.getParticipants().remove(employee);
            groupChatRepository.save(chat);
        }

        // Delete all leads associated with the employee
        leadRepository.deleteByEmployee(employee);

        // Delete all attendance records
        attendanceRepository.deleteByEmployee(employee);

        // Delete all logs and salaries
        dailySalaryLogRepository.deleteByEmployeeId(id);
        monthlySalaryLogRepository.deleteByEmployeeId(id);
        workTimeLocationLogRepository.deleteByEmployeeId(id);
        overtimeLogRepository.deleteByEmployeeId(id);
        notificationRepository.deleteByEmployeeId(id);
        employeeSalaryRepositary.deleteByEmployeeId(id);

        repo.deleteById(id);
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

    // ---------------- RESET DATA ----------------
    @Transactional
    public void resetCompanyData() {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        LOG.info("Starting data reset for company: " + companyId);

        // 1. Delete Logs & Records
        notificationRepository.deleteAll();
        dailySalaryLogRepository.deleteAll();
        monthlySalaryLogRepository.deleteAll();
        overtimeLogRepository.deleteAll();
        workTimeLocationLogRepository.deleteAll();
        attendanceRepository.deleteAll();

        List<com.crm.model.Social> socialEntries = socialRepository.findAll().stream()
                .filter(s -> {
                    return (s.getClient() != null && s.getClient().getCompanyId().equals(companyId));
                }).toList();
        socialRepository.deleteAll(socialEntries);

        // 2. Clear potential orphan Tasks (linked to company)
        List<com.crm.model.Task> tasks = taskRepository.findByCompanyId(companyId);
        taskRepository.deleteAll(tasks);

        // 3. Delete Bills & Leads
        List<com.crm.model.Bill> bills = billRepository.findAll().stream()
                .filter(b -> b.getCompanyId().equals(companyId)).toList();
        billRepository.deleteAll(bills);

        List<com.crm.model.Lead> leads = leadRepository.findAll().stream()
                .filter(l -> l.getEmployee().getCompanyId().equals(companyId)).toList();
        leadRepository.deleteAll(leads);

        // 4. Delete Clients (Cascades to Projects -> Tasks, Participants)
        List<com.crm.model.ClientDetails> clients = clientDetailsRepository.findByCompanyId(companyId);
        clientDetailsRepository.deleteAll(clients);

        // 5. Orphan Projects (without clients or failed cascade)
        List<ProjectGroupDetails> projects = projectGroupRepository.findByCompanyId(companyId);
        projectGroupRepository.deleteAll(projects);

        // 6. Employees (Except Admin)
        List<Employee> allEmployees = repo.findByCompanyId(companyId);
        for (Employee emp : allEmployees) {
            if (emp.getRole() != 1) { // 1 = Admin
                projectParticipantRepository.deleteByEmployee(emp);
                repo.delete(emp);
            }
        }

        LOG.info("Data reset complete for company: " + companyId);
    }

    private String safelyGetString(Map<String, ?> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            throw new IllegalArgumentException("Field '" + key + "' is missing or null");
        }
        return value.toString();
    }
}
