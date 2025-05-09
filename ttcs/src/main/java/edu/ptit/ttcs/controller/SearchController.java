package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.response.SearchResponseDTO;
import edu.ptit.ttcs.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, methods = { RequestMethod.GET,
        RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
        RequestMethod.OPTIONS }, allowCredentials = "false")
public class SearchController {

    private final SearchService searchService;

    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("")
    public ResponseEntity<SearchResponseDTO> search(
            @RequestParam Long projectId,
            @RequestParam String query) {
        SearchResponseDTO results = searchService.search(projectId, query);
        return ResponseEntity.ok(results);
    }
}