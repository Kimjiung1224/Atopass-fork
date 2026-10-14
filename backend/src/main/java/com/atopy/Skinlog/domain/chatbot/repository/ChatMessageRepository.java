package com.atopy.Skinlog.domain.chatbot.repository;

import com.atopy.Skinlog.domain.chatbot.entity.ChatMessage;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

	List<ChatMessage> findBySessionIdOrderByIdAsc(String sessionId);

	/** LLM에 넘길 최근 대화. 최신순으로 받아오므로 호출한 쪽에서 뒤집어 쓴다. */
	List<ChatMessage> findTop20BySessionIdOrderByIdDesc(String sessionId);

	@Modifying
	@Query("delete from ChatMessage m where m.createdAt < :limit")
	int deleteOlderThan(@Param("limit") LocalDateTime limit);

}
