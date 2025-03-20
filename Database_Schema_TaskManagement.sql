CREATE DATABASE TaskManagementDB;
USE TaskManagementDB;

-- User Table
CREATE TABLE Users (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'User',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
);

-- TaskItem Table
CREATE TABLE TaskItems (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(1000) NULL,
    DueDate DATETIME NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Todo',
    Priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    AssignedTo VARCHAR(100) NULL,
    CreatedBy VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Foreign Key Constraint (Optional: If Users are assigned to Tasks)
ALTER TABLE TaskItems ADD CONSTRAINT FK_AssignedTo FOREIGN KEY (AssignedTo) REFERENCES Users(Username);
