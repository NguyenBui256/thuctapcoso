package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.IssueRepository;
import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.FilterData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;

    public FilterData getFilters(long projectId, FilterParams filters) {

        return null;
    }
}
