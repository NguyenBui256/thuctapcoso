package edu.ptit.ttcs.entity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponseDTO {
    private List<UserStoryDTO> userStories;
    private List<TaskDTO> tasks;
    private List<IssueDTO> issues;
    private List<WikiPageDTO> wikiPages;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WikiPageDTO {
        private Long id;
        private String slug;
        private String title;
        private String content;
        private String createdAt;
        private String updatedAt;
    }
}