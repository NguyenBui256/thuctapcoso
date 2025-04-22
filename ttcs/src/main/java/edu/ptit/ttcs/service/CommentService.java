package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.request.CommentRequestDTO;
import edu.ptit.ttcs.dto.response.CommentResponseDTO;

import java.util.List;

public interface CommentService {
    CommentResponseDTO createComment(CommentRequestDTO commentRequestDTO);

    List<CommentResponseDTO> getCommentsByTaskId(Long taskId);

    void deleteComment(Long commentId);
}