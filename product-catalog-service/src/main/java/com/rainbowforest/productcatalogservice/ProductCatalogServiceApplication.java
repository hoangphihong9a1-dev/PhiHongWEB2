package com.rainbowforest.productcatalogservice;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.math.BigDecimal;
import java.util.Arrays;

@SpringBootApplication
@EnableEurekaClient
@EnableJpaRepositories
public class ProductCatalogServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductCatalogServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner init(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                Product p1 = new Product();
                p1.setProductName("Premium Wireless Headphones");
                p1.setPrice(new BigDecimal("299.99"));
                p1.setDiscription("High-quality noise-canceling headphones");
                p1.setCategory("Electronics");
                p1.setAvailability(1);
                p1.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80");

                Product p2 = new Product();
                p2.setProductName("Mechanical Keyboard Pro");
                p2.setPrice(new BigDecimal("149.99"));
                p2.setDiscription("RGB mechanical keyboard with tactile switches");
                p2.setCategory("Accessories");
                p2.setAvailability(1);
                p2.setImageUrl("https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80");

                Product p3 = new Product();
                p3.setProductName("Ultra HD Monitor 4K");
                p3.setPrice(new BigDecimal("499.99"));
                p3.setDiscription("32-inch 4K monitor for professionals");
                p3.setCategory("Displays");
                p3.setAvailability(1);
                p3.setImageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80");

                productRepository.saveAll(Arrays.asList(p1, p2, p3));
                System.out.println("Inserted sample products into database.");
            }
        };
    }
}
