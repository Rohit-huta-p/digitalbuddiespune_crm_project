package com.crm.utility;

public class Constants {

	//Response 
	public static final String COMPANY_ACCESS_DENIED = 
		    "Operation forbidden: You are not authorized to perform actions on a different company.";
	
    // Task Management Entity
    public static final String FIELD_TASK_ID = "taskId";
    public static final String FIELD_TASK_NAME = "taskName";
    public static final String FIELD_DESCRIPTION = "description";
    public static final String FIELD_ASSIGNED_TIMESTAMP = "assignedTimestamp";
    public static final String FIELD_DEADLINE_TIMESTAMP = "deadlineTimestamp";
    public static final String FIELD_STATUS = "status";
    public static final String FIELD_ASSIGNED_TO_EMPLOYEE_ID = "assignedToEmployeeId";
    public static final String FIELD_ASSIGNED_BY = "assignedBy";
    public static final String FIELD_EMAIL = "email";
    public static final String PRIORITY ="priority";

    // Location Entity
    public static final String FIELD_EMPLOYEE_ID = "employeeId";
    public static final String FIELD_LATITUDE = "latitude";
    public static final String FIELD_LONGITUDE = "longitude";

    // Bill Entity
    public static final String FIELD_CUSTOMER_NAME = "customerName";
    public static final String FIELD_AMOUNT = "amount";
    public static final String FIELD_BILL_EMAIL = "email";
    public static final String FIELD_GENERATED_BY="generatedBy";
    public static final String FIELD_SERVICE_DESC="serviceDesc";
    public static final String FIELD_SERVICE_TITLE="serviceTitle";
    public static final String BILL_DUE_DATE="bill_due_date";
    
    //notification
    public static final String FIELD_NOTIFICATION_TITLE="notificationTitle";
    public static final String FIELD_NOTIFICATION_TEXT="notificationText";
    

    // Employee Salary Entity
    public static final String FIELD_EMPLOYEE_NAME = "employeeName";
    public static final String FIELD_HOURLY_SALARY = "hourlySalary";


    //project group
    
    public static final String PROJECT_GROUPID = "projectGroupId";
    public static final String PROJECT_NAME = "projectName";
    public static final String PROJECT_DESC = "projectDesc";
    public static final String CREATED_BY_ID = "createdById";
    public static final String GROUPLEADER_ID = "groupLeaderIds";
    public static final String PARTICIPANTS = "participants";
    
    
    //client details
    public static final String CLIENT_ID = "clientId";
    public static final String CLIENT_NAME = "name";
    public static final String CLIENT_PHNO = "phno";
    public static final String CLIENT_EMAIL = "email";
    public static final String CLIENT_USERNAME = "username";
    public static final String CLIENT_PASSWORD = "password";
    public static final String CLIENT_ROLE = "role";
    
    //salary
    public static final String MONTHLY_SALARY = "monthlySalary";

    //coustomernotification
    
    public static final String COUSTOMER_ID = "coustomerId";
    public static final String COUSTOMER_NOTIFICATION_ID="coustomerNotificationId";
    
    //company
    public static final String COMPANY_ID = "companyId";
    public static final String COMPANY_NAME="companyName";
    


}
