package com.atopy.Skinlog.global.config;

import com.atopy.Skinlog.global.security.CurrentMemberArgumentResolver;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	public static final String API_PREFIX = "/api/v1";

	/** 모든 @RestController 경로 앞에 /api/v1 을 붙인다. 컨트롤러에는 /auth, /records 처럼 적는다. */
	@Override
	public void configurePathMatch(PathMatchConfigurer configurer) {
		configurer.addPathPrefix(API_PREFIX, c -> c.isAnnotationPresent(RestController.class));
	}

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
		resolvers.add(new CurrentMemberArgumentResolver());
	}

}
