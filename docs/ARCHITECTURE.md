# Intelbiz Architecture Overview

## Layered Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        Pages[Pages<br/>Dashboard, ReportDetail]
        Components[Components<br/>TransactionTable, etc]
    end
    
    subgraph "State Management Layer"
        Hooks[Custom Hooks<br/>useReports, useAnalytics, useTransactionFilter]
    end
    
    subgraph "Business Logic Layer"
        Services[Services<br/>reportService, transactionService]
    end
    
    subgraph "Utility Layer"
        Utils[Utilities<br/>dateUtils, formatters, dataTransformers]
        Parser[reportParser]
    end
    
    subgraph "Type System"
        Types[types/, types/validation]
    end
    
    Pages --> Hooks
    Components --> Hooks
    Hooks --> Services
    Services --> Utils
    Services --> Parser
    Parser --> Utils
    
    Pages -.uses.-> Types
    Components -.uses.-> Types
    Hooks -.uses.-> Types
    Services -.uses.-> Types
    Utils -.uses.-> Types
    
    style Pages fill:#e3f2fd
    style Components fill:#e3f2fd
    style Hooks fill:#fff3e0
    style Services fill:#f3e5f5
    style Utils fill:#e8f5e9
    style Parser fill:#e8f5e9
    style Types fill:#fce4ec
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Hook
    participant Service
    participant Utility
    
    User->>Component: Interact (click, type)
    Component->>Hook: Call hook function
    Hook->>Service: Execute business logic
    Service->>Utility: Transform/Format data
    Utility-->>Service: Return result
    Service-->>Hook: Return processed data
    Hook-->>Component: Update state
    Component-->>User: Render UI
```

## Module Dependencies

```mermaid
graph LR
    A[App.tsx] --> B[useReports]
    A --> C[Pages]
    
    C --> D[useAnalytics]
    C --> E[Components]
    
    E --> F[useTransactionFilter]
    
    B --> G[reportService]
    D --> H[transactionService]
    F --> H
    
    G --> I[reportParser]
    I --> J[dateUtils]
    I --> K[dataTransformers]
    
    H --> J
    H --> K
    
    C --> L[formatters]
    E --> L
    
    style A fill:#ffeb3b
    style B fill:#ff9800
    style C fill:#2196f3
    style D fill:#ff9800
    style E fill:#2196f3
    style F fill:#ff9800
    style G fill:#9c27b0
    style H fill:#9c27b0
    style I fill:#4caf50
    style J fill:#4caf50
    style K fill:#4caf50
    style L fill:#4caf50
```

## Key Principles

### 1. Unidirectional Data Flow
Data flows in one direction: **UI → Hooks → Services → Utilities**

### 2. Separation of Concerns
- **UI Layer**: Presentation only
- **Hooks**: Stateful logic
- **Services**: Business logic
- **Utilities**: Pure functions

### 3. Dependency Inversion
- Components depend on hooks, not services
- Hooks depend on services, not utilities directly
- Services coordinate utility functions

### 4. Single Responsibility
Each module has one clear purpose:
- `dateUtils.ts` - Date operations only
- `formatters.ts` - Formatting only
- `transactionService.ts` - Transaction logic only

## Benefits

 **Testability** - Each layer can be tested independently  
 **Maintainability** - Easy to locate and modify code  
 **Reusability** - Hooks and services can be reused  
 **Scalability** - Easy to add new features  
 **Type Safety** - Strong TypeScript typing throughout
