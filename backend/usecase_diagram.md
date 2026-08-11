# Backend Use Case Diagram

This document illustrates the use cases for the Eternal E-commerce backend based on the frontend UI requirements.

## Use Case Diagrams (Mermaid)
```mermaid
usecaseDiagram
    actor Customer as "Customer"
    actor Guest as "Guest User"
    actor Admin as "Store Admin"
    actor Staff as "Store Staff"

    package "Authentication & Authorization" {
        usecase "Register Account" as UC1
        usecase "Login" as UC2
        usecase "Reset Password" as UC3
        usecase "Manage Profile & Addresses" as UC4
    }

    package "Product & Catalog (Shop)" {
        usecase "Browse Products" as UC5
        usecase "Search & Filter Products" as UC6
        usecase "View Product Details" as UC7
    }

    package "Cart & Checkout" {
        usecase "Manage Cart" as UC8
        usecase "Apply Coupon" as UC9
        usecase "Checkout & Pay" as UC10
    }

    package "Customer Engagement" {
        usecase "Manage Wishlist" as UC11
        usecase "Submit Review" as UC12
        usecase "View Order History" as UC13
        usecase "View Loyalty Points" as UC14
    }

    package "Admin: Catalog Management" {
        usecase "Add/Edit/Delete Products" as UC15
        usecase "Manage Categories" as UC16
        usecase "Manage Collections" as UC17
        usecase "Manage Inventory" as UC18
    }

    package "Admin: Order & Customer Management" {
        usecase "View & Update Orders" as UC19
        usecase "Manage Customers" as UC20
        usecase "Approve/Reject Reviews" as UC21
    }

    package "Admin: Store Operations" {
        usecase "Manage Marketing/Coupons" as UC22
        usecase "View Analytics Dashboard" as UC23
        usecase "Manage Store Settings" as UC24
        usecase "Manage Staff Users" as UC25
    }

    %% Relationships - Guest
    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC5
    Guest --> UC6
    Guest --> UC7
    Guest --> UC8
    Guest --> UC10

    %% Relationships - Customer
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    Customer --> UC10
    Customer --> UC11
    Customer --> UC12
    Customer --> UC13
    Customer --> UC14

    %% Relationships - Admin
    Admin --> UC2
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25

    %% Relationships - Staff
    Staff --> UC2
    Staff --> UC15
    Staff --> UC18
    Staff --> UC19
    Staff --> UC21
```

## Detailed Use Cases

### Customer / Guest Uses Cases
1.  **Authentication**: Users can sign up, log in, recover passwords, and manage their profile and saved addresses.
2.  **Shopping**: Users can browse the catalog, filter by categories/collections, search for specific terms, and view detailed product information including variants and stock status.
3.  **Checkout Flow**: Users add items to the cart, apply valid discount coupons, enter shipping/billing info, and securely process payments.
4.  **Engagement**: Authenticated users can maintain a wishlist, write product reviews, check their order history, and track loyalty points.

### Admin / Staff Use Cases
1.  **Catalog & Inventory**: Admins can create, update, and delete products, variants, categories, and collections. They can also perform stock adjustments.
2.  **Order Management**: Admins can view all customer orders, process them, update statuses (e.g., Shipped, Delivered), and manage refunds or cancellations.
3.  **Customer Management**: Admins have access to the customer list, individual purchase histories, and can moderate customer reviews.
4.  **Store Operations**: Admins can configure store-wide settings (shipping rates, taxes), create marketing campaigns/coupons, and view high-level analytics (sales, traffic, conversions). Admins can also manage staff accounts. Staff users have a restricted subset of these permissions (e.g., managing orders and products, but not store settings or staff users).
