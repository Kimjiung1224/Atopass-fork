package com.atopy.Skinlog.domain.member.repository;

import com.atopy.Skinlog.domain.member.entity.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

	Optional<Member> findByEmail(String email);

	boolean existsByEmail(String email);

}
