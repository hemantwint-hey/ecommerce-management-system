Project Overview

E-Commerce Backend Application is a RESTful API built using Java, Spring Boot, Spring Security, JWT, Hibernate, and MySQL. The system follows a layered architecture consisting of Controllers, Services, Repositories, DTOs, Security Components, and Entity Models. It supports authentication, product management, category management, cart operations, order processing, payment handling, and address management.

UML Architecture Diagram

Paste this Mermaid code into README.md:

```mermaid
flowchart TD

    Client["Frontend / Postman"]

    Client --> Security["JWT Security Layer"]

    Security --> Controllers

    subgraph Controllers
        AuthController
        ProductController
        CategoryController
        CartController
        OrderController
        AddressController
    end

    Controllers --> Services

    subgraph Services
        ProductService
        CategoryService
        CartService
        OrderService
        AddressService
        FileService
    end

    Services --> DTOs
    Services --> Repositories

    subgraph DTOs
        ProductDTO
        CategoryDTO
        CartDTO
        OrderDTO
        AddressDTO
        PaymentDTO
    end

    subgraph Repositories
        ProductRepository
        CategoryRepository
        CartRepository
        CartItemRepository
        OrderRepository
        OrderItemRepository
        PaymentRepository
        UserRepository
        RoleRepository
        AddressRepository
    end

    Repositories --> Database[(MySQL)]

    Services --> Entities

    subgraph Entities
        User
        Role
        Product
        Category
        Cart
        CartItem
        Order
        OrderItem
        Payment
        Address
    end

    Controllers --> ExceptionHandler

    subgraph ExceptionHandler
        APIException
        ResourceNotFoundException
        MyGlobalExceptionHandler
    end
```
Entity Relationship UML

This one will impress recruiters more:

```mermaid
classDiagram

class User
class Role
class Product
class Category
class Cart
class CartItem
class Order
class OrderItem
class Payment
class Address

User "1" --> "*" Address
User "1" --> "1" Cart
User "1" --> "*" Order
User "*" --> "*" Role

Category "1" --> "*" Product

Cart "1" --> "*" CartItem
CartItem "*" --> "1" Product

Order "1" --> "*" OrderItem
OrderItem "*" --> "1" Product

Order "1" --> "1" Payment
```
