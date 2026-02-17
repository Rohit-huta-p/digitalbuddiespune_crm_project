package com.crm.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.crm.exception.ForBiddenException;
import com.crm.exception.InvalidCredentialsException;
import com.crm.exception.NotFoundException;
import com.crm.model.ClientDetails;
import com.crm.model.Employee;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.ClientDetailsRepository;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;

@Service
public class ClientService {

    @Autowired
    private ClientDetailsRepository clientDetailsRepository;

    @Autowired
    private JwtBasedCurrentUserProvider basedCurrentUserProvider;

    // ✅ Compute progress dynamically from totals and completed fields
    private void computeAndSetProgress(ClientDetails client) {
        int totalPosts = client.getTotalPosts() == null ? 0 : client.getTotalPosts();
        int totalVideos = client.getTotalVideos() == null ? 0 : client.getTotalVideos();
        int totalShoots = client.getTotalShoots() == null ? 0 : client.getTotalShoots();

        int completedPosts = client.getCompletedPosts() == null ? 0 : client.getCompletedPosts();
        int completedVideos = client.getCompletedVideos() == null ? 0 : client.getCompletedVideos();
        int completedShoots = client.getCompletedShoots() == null ? 0 : client.getCompletedShoots();

        int total = totalPosts + totalVideos + totalShoots;
        int done = completedPosts + completedVideos + completedShoots;

        double workDonePct = 0.0;
        double pendingPct = 100.0;

        if (total > 0) {
            workDonePct = (done * 100.0) / total;
            if (workDonePct > 100.0)
                workDonePct = 100.0;
            pendingPct = 100.0 - workDonePct;
        }

        client.setWorkDonePercentage(workDonePct);
        client.setPendingPercentage(pendingPct);
    }

    // ✅ Create Client
    public ResponseEntity<ResponseDTO<Map<String, Object>>> createClient(Map<String, ?> request) {
        Long companyIdFromToken = basedCurrentUserProvider.getCurrentCompanyId();
        // Long requestCompanyId =
        // Long.parseLong(request.get(Constants.COMPANY_ID).toString());
        // if (!companyIdFromToken.equals(requestCompanyId)) {
        // throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        // }

        String name = request.get(Constants.CLIENT_NAME).toString();
        String phno = request.get(Constants.CLIENT_PHNO).toString();
        String email = request.get(Constants.CLIENT_EMAIL).toString();
        String password = request.get(Constants.CLIENT_PASSWORD).toString();

        Integer totalPosts = request.get("totalPosts") != null ? Integer.parseInt(request.get("totalPosts").toString())
                : 0;
        Integer totalVideos = request.get("totalVideos") != null
                ? Integer.parseInt(request.get("totalVideos").toString())
                : 0;
        Integer totalShoots = request.get("totalShoots") != null
                ? Integer.parseInt(request.get("totalShoots").toString())
                : 0;

        ClientDetails client = new ClientDetails();
        client.setName(name);
        client.setPhno(phno);
        client.setEmail(email);
        client.setPassword(password);
        client.setUsername(phno);
        client.setRole(4);
        client.setCompanyId(companyIdFromToken);
        client.setTotalPosts(totalPosts);
        client.setTotalVideos(totalVideos);
        client.setTotalShoots(totalShoots);

        computeAndSetProgress(client);
        clientDetailsRepository.save(client);

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Client created successfully");
        responseAttributes.put("clientId", client.getClientId());

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);
        return ResponseEntity.ok(responseDTO);
    }

    // ✅ Update Client Info and Progress
    public ResponseEntity<ResponseDTO<Map<String, Object>>> updateClient(Map<String, ?> request) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());
        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Long clientId = Long.parseLong(request.get(Constants.CLIENT_ID).toString());
        ClientDetails client = clientDetailsRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Client not found with ID: " + clientId));

        if (request.containsKey("name"))
            client.setName(request.get("name").toString());
        if (request.containsKey("phno"))
            client.setPhno(request.get("phno").toString());
        if (request.containsKey("email"))
            client.setEmail(request.get("email").toString());
        if (request.containsKey("password"))
            client.setPassword(request.get("password").toString());

        if (request.containsKey("totalPosts"))
            client.setTotalPosts(Integer.parseInt(request.get("totalPosts").toString()));
        if (request.containsKey("totalVideos"))
            client.setTotalVideos(Integer.parseInt(request.get("totalVideos").toString()));
        if (request.containsKey("totalShoots"))
            client.setTotalShoots(Integer.parseInt(request.get("totalShoots").toString()));
        if (request.containsKey("completedPosts"))
            client.setCompletedPosts(Integer.parseInt(request.get("completedPosts").toString()));
        if (request.containsKey("completedVideos"))
            client.setCompletedVideos(Integer.parseInt(request.get("completedVideos").toString()));
        if (request.containsKey("completedShoots"))
            client.setCompletedShoots(Integer.parseInt(request.get("completedShoots").toString()));

        computeAndSetProgress(client);
        clientDetailsRepository.save(client);

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Client updated successfully");

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);
        return ResponseEntity.ok(responseDTO);
    }

    // ✅ Get All Clients
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllClients(Long requestCompanyId) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        List<Map<String, Object>> clients = clientDetailsRepository.findByCompanyId(requestCompanyId).stream()
                .map(client -> {
                    Map<String, Object> clientMap = new HashMap<>();
                    clientMap.put("clientId", client.getClientId());
                    clientMap.put("name", client.getName());
                    clientMap.put("email", client.getEmail());
                    clientMap.put("phno", client.getPhno());
                    clientMap.put("username", client.getUsername());
                    clientMap.put("totalPosts", client.getTotalPosts());
                    clientMap.put("totalVideos", client.getTotalVideos());
                    clientMap.put("totalShoots", client.getTotalShoots());
                    clientMap.put("completedPosts", client.getCompletedPosts());
                    clientMap.put("completedVideos", client.getCompletedVideos());
                    clientMap.put("completedShoots", client.getCompletedShoots());
                    clientMap.put("workDonePercentage", client.getWorkDonePercentage());
                    clientMap.put("pendingPercentage", client.getPendingPercentage());
                    return clientMap;
                }).collect(Collectors.toList());

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("clients", clients);

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);
        return ResponseEntity.ok(responseDTO);
    }

    // ✅ Delete Client
    public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteClient(Map<String, ?> request) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());
        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Long clientId = Long.parseLong(request.get(Constants.CLIENT_ID).toString());
        if (!clientDetailsRepository.existsById(clientId)) {
            throw new NotFoundException("Client not found");
        }

        clientDetailsRepository.deleteById(clientId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Client deleted successfully");

        ResponseDTO<Map<String, Object>> dto = new ResponseDTO<>();
        dto.setAttributes(response);
        return ResponseEntity.ok(dto);
    }

    // ✅ Authenticate Client (Login)
    public ClientDetails authenticateClient(String username, String password) {
        ClientDetails client = clientDetailsRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Client not found for username: " + username));

        if (!client.getPassword().equals(password)) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return client;
    }

    // ✅ Update Work Progress API (Manual Adjustment)
    public ResponseEntity<ResponseDTO<Map<String, Object>>> updateClientWorkProgress(Map<String, ?> request) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());
        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Long clientId = Long.parseLong(request.get(Constants.CLIENT_ID).toString());
        ClientDetails client = clientDetailsRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Client not found"));

        if (request.containsKey("completedPosts"))
            client.setCompletedPosts(Integer.parseInt(request.get("completedPosts").toString()));
        if (request.containsKey("completedVideos"))
            client.setCompletedVideos(Integer.parseInt(request.get("completedVideos").toString()));
        if (request.containsKey("completedShoots"))
            client.setCompletedShoots(Integer.parseInt(request.get("completedShoots").toString()));

        computeAndSetProgress(client);
        clientDetailsRepository.save(client);

        Map<String, Object> response = new HashMap<>();
        response.put("clientId", clientId);
        response.put("workDonePercentage", client.getWorkDonePercentage());
        response.put("pendingPercentage", client.getPendingPercentage());

        ResponseDTO<Map<String, Object>> dto = new ResponseDTO<>();
        dto.setAttributes(response);
        return ResponseEntity.ok(dto);
    }

    // ✅ Fetch projects associated with a client
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getProjectsByClientId(Map<String, ?> request) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());
        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Long clientId = Long.parseLong(request.get(Constants.CLIENT_ID).toString());
        ClientDetails client = clientDetailsRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Client not found with ID: " + clientId));

        // ✅ Assuming you have relation: One Client → Many Projects
        List<Map<String, Object>> projects = client.getProjects().stream().map(project -> {
            Map<String, Object> p = new HashMap<>();
            p.put("projectId", project.getProjectId());
            p.put("projectName", project.getProjectName());
            p.put("projectDesc", project.getProjectDesc());
            p.put("status", project.getStatus());
            p.put("createdAt", project.getCreatedAt());
            return p;
        }).collect(Collectors.toList());

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("projects", projects);
        responseAttributes.put("clientName", client.getName());

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);
        return ResponseEntity.ok(responseDTO);
    }

}
