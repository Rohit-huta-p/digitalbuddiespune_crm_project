package com.crm.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.crm.model.ClientDetails;
import com.crm.model.dto.ResponseDTO;
import com.crm.service.ClientService;
import com.crm.utility.Constants;
import com.crm.utility.JwtProvider;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping("client")
public class ClientController {

    @Autowired
    ClientService clientService;

    @PostMapping("/create")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> createClient(@RequestBody Map<String, ?> request) {
        new RequestValidator(request).hasPhoneNumber(Constants.CLIENT_PHNO).hasEmail(Constants.CLIENT_EMAIL)
                .hasName(Constants.CLIENT_NAME).hasPassword(Constants.CLIENT_PASSWORD);

        return clientService.createClient(request);
    }

    @PostMapping("/update")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> updateClient(@RequestBody Map<String, ?> request) {
        // expects CLIENT_ID and COMPANY_ID
        new RequestValidator(request).hasId(Constants.CLIENT_ID, true).hasId(Constants.COMPANY_ID, true);
        return clientService.updateClient(request);
    }

    @PostMapping("/getAll")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllClients(@RequestBody Map<String, ?> request) {
        new RequestValidator(request).hasId(Constants.COMPANY_ID, false);
        Long companyId = request.get(Constants.COMPANY_ID) != null
                ? Long.parseLong(request.get(Constants.COMPANY_ID).toString())
                : null;
        return clientService.getAllClients(companyId);
    }

    @PostMapping("/get-projects")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getClientProjects(@RequestBody Map<String, ?> request) {
        new RequestValidator(request).hasId(Constants.CLIENT_ID, true).hasId(Constants.COMPANY_ID, true);

        return clientService.getProjectsByClientId(request);
    }

    @PostMapping("/delete")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteClient(@RequestBody Map<String, ?> request) {
        new RequestValidator(request).hasId(Constants.CLIENT_ID, true).hasId(Constants.COMPANY_ID, false);

        return clientService.deleteClient(request);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> loginClient(@RequestBody Map<String, ?> credentials) {
        new RequestValidator(credentials).hasPhoneNumber(Constants.CLIENT_USERNAME)
                .hasPassword(Constants.CLIENT_PASSWORD);

        String username = credentials.get(Constants.CLIENT_USERNAME).toString();
        String password = credentials.get(Constants.CLIENT_PASSWORD).toString();

        ClientDetails client = clientService.authenticateClient(username, password);

        JwtProvider jwtProvider = new JwtProvider();
        String token = jwtProvider.generateToken(client);

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("token", token);
        responseAttributes.put("client_Id", client.getClientId());
        responseAttributes.put("name", client.getName());
        responseAttributes.put("message", "Login successful");

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> logout() {

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Logout successful.");

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/update-work")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> updateWorkProgress(@RequestBody Map<String, ?> request) {
        new RequestValidator(request)
                .hasId(Constants.CLIENT_ID, true)
                .hasId(Constants.COMPANY_ID, true)
                .optional("completedPosts")
                .optional("completedVideos")
                .optional("completedShoots");

        return clientService.updateClientWorkProgress(request);
    }

}
