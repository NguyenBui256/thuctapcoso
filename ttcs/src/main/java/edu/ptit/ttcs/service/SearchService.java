package edu.ptit.ttcs.service;

import edu.ptit.ttcs.entity.dto.response.SearchResponseDTO;

public interface SearchService {
    /**
     * Search for all entities in the project by a query string
     * 
     * @param projectId the ID of the project to search within
     * @param query     the search query
     * @return SearchResponseDTO containing search results from different entities
     */
    SearchResponseDTO search(Long projectId, String query);
}