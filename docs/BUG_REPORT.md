# FarmBox Bug Report

**Generated**: December 9, 2025
**Tested By**: Senior Software Engineer
**Test Document**: docs/TESTING.md
**Status**: ALL BUGS FIXED AND VERIFIED

---

## Executive Summary

Comprehensive testing of the FarmBox platform revealed **5 critical bugs** and **2 medium-priority issues**. All bugs have been **FIXED and VERIFIED** on December 9, 2025.

### Bug Status Summary
| Bug ID | Severity | Status | Verified |
|--------|----------|--------|----------|
| BUG-001 | CRITICAL (P0) | FIXED | Yes |
| BUG-002 | CRITICAL (P0) | FIXED | Yes |
| BUG-003 | HIGH (P1) | FIXED | Yes |
| BUG-004 | HIGH (P1) | FIXED | Yes |
| BUG-005 | HIGH (P1) | DOCUMENTED | API works as designed |
| BUG-006 | MEDIUM (P2) | FIXED | Yes |
| BUG-007 | MEDIUM (P2) | FIXED | Yes |

### Files Modified
- `backend/src/controllers/order.controller.ts` - Added quantity validation (BUG-001, BUG-002, BUG-007)
- `backend/src/controllers/auth.controller.ts` - Added email, password, and phone validation (BUG-003, BUG-004, BUG-006)

---

## Critical Bugs (P0)

### BUG-001: Negative Quantity Orders Accepted

**Test ID**: EDGE-008
**Severity**: CRITICAL (P0)
**Component**: Order Controller
**File**: `backend/src/controllers/order.controller.ts`

**Description**:
The unified order creation endpoint accepts negative quantities, resulting in orders with negative subtotals and totals. This is a critical financial vulnerability.

**Steps to Reproduce**:
```bash
curl -X POST "http://localhost:3001/api/orders/unified" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer_token>" \
  -d '{
    "deliveryType": "PICKUP",
    "items": [{"productId": "<product_id>", "quantity": -5}]
  }'
```

**Actual Result**:
```json
{
  "success": true,
  "orderNumber": "ORD-1733753679428",
  "total": "-12.5",
  "subtotal": "-17.5",
  "items": [{"quantity": "-5", "totalPrice": "-17.5"}]
}
```

**Expected Result**:
400 Bad Request - "Quantity must be a positive number"

**Impact**:
- Financial fraud vulnerability - users could create orders with negative totals
- Database integrity compromised with invalid data
- Accounting/reporting systems affected

**Recommended Fix**:
```typescript
// In order.controller.ts - createUnifiedOrder function
// Add validation before processing items:
for (const item of items) {
  if (!item.quantity || item.quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Quantity must be a positive number greater than 0'
    });
  }
}
```

---

### BUG-002: Zero Quantity Orders Accepted

**Test ID**: EDGE-007
**Severity**: CRITICAL (P0)
**Component**: Order Controller
**File**: `backend/src/controllers/order.controller.ts`

**Description**:
The unified order creation endpoint accepts quantity of 0, creating meaningless orders with $0 value.

**Steps to Reproduce**:
```bash
curl -X POST "http://localhost:3001/api/orders/unified" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer_token>" \
  -d '{
    "deliveryType": "PICKUP",
    "items": [{"productId": "<product_id>", "quantity": 0}]
  }'
```

**Actual Result**:
201 Created - Order with $0 subtotal

**Expected Result**:
400 Bad Request - "Quantity must be at least 1"

**Impact**:
- Database pollution with empty orders
- Confusing order history for customers
- Potential issues with order processing workflows

**Recommended Fix**:
Same fix as BUG-001 - validate quantity > 0

---

## High Priority Bugs (P1)

### BUG-003: Invalid Email Format Accepted in Registration

**Test ID**: AUTH-004
**Severity**: HIGH (P1)
**Component**: Auth Controller
**File**: `backend/src/controllers/auth.controller.ts`

**Description**:
The registration endpoint accepts invalid email formats like "invalid-email" without the @ symbol or domain.

**Steps to Reproduce**:
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "name": "Test User"
  }'
```

**Actual Result**:
201 Created - User registered with invalid email

**Expected Result**:
400 Bad Request - "Invalid email format"

**Impact**:
- Users cannot receive important emails (order confirmations, password resets)
- Data quality issues in user database
- Potential issues with email-dependent features

**Recommended Fix**:
```typescript
// Add email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid email format' });
}
```

---

### BUG-004: Short Password Accepted in Registration

**Test ID**: AUTH-005
**Severity**: HIGH (P1)
**Component**: Auth Controller
**File**: `backend/src/controllers/auth.controller.ts`

**Description**:
The registration endpoint accepts passwords shorter than 6 characters, despite documentation stating 6+ chars required.

**Steps to Reproduce**:
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shortpass@test.com",
    "password": "123",
    "name": "Test User"
  }'
```

**Actual Result**:
201 Created - User registered with 3-character password

**Expected Result**:
400 Bad Request - "Password must be at least 6 characters"

**Impact**:
- Security vulnerability - weak passwords easier to brute force
- Non-compliance with security best practices
- Inconsistent with documented requirements

**Recommended Fix**:
```typescript
// Add password length validation
if (!password || password.length < 6) {
  return res.status(400).json({
    error: 'Password must be at least 6 characters'
  });
}
```

---

### BUG-005: Subscription Pause API Parameter Mismatch

**Test ID**: SUB-015
**Severity**: HIGH (P1)
**Component**: Category Subscription Controller
**File**: `backend/src/controllers/category-subscription.controller.ts`

**Description**:
The test plan documents that pausing a subscription should use a `weeks` parameter, but the API expects `startDate` and `endDate`. This causes a mismatch between documentation and implementation.

**Steps to Reproduce**:
```bash
# Per test plan (doesn't work):
curl -X POST "/api/category-subscriptions/{id}/pause" \
  -d '{"weeks": 2}'

# Actual API requirement:
curl -X POST "/api/category-subscriptions/{id}/pause" \
  -d '{"startDate": "2025-12-10", "endDate": "2025-12-24"}'
```

**Actual Result**:
Using `weeks` parameter is ignored; requires explicit dates

**Expected Result**:
Either update API to accept `weeks` (simpler UX) or update documentation

**Impact**:
- Frontend integration issues
- Poor developer experience
- Documentation inconsistency

**Recommended Fix**:
Option A (Preferred - Better UX): Accept `weeks` parameter and calculate dates server-side
```typescript
if (weeks) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (weeks * 7));
}
```

Option B: Update documentation to reflect actual API

---

## Medium Priority Bugs (P2)

### BUG-006: Missing Phone Format Validation

**Test ID**: AUTH-007
**Severity**: MEDIUM (P2)
**Component**: Auth Controller
**File**: `backend/src/controllers/auth.controller.ts`

**Description**:
Phone numbers are accepted without format validation. Tunisia phone numbers should follow specific patterns.

**Steps to Reproduce**:
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -d '{"email": "test@test.com", "password": "password123", "name": "Test", "phone": "abc123"}'
```

**Actual Result**:
User created with invalid phone "abc123"

**Expected Result**:
400 Bad Request - "Invalid phone format"

**Recommended Fix**:
```typescript
// Tunisia phone validation (8 digits, optionally with +216 prefix)
const phoneRegex = /^(\+216)?[0-9]{8}$/;
if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
  return res.status(400).json({ error: 'Invalid phone format' });
}
```

---

### BUG-007: No Maximum Quantity Validation

**Test ID**: EDGE-009
**Severity**: MEDIUM (P2)
**Component**: Order Controller
**File**: `backend/src/controllers/order.controller.ts`

**Description**:
Very large quantities (e.g., 999999) are accepted without validation against stock or reasonable limits.

**Steps to Reproduce**:
```bash
curl -X POST "http://localhost:3001/api/orders/unified" \
  -d '{"items": [{"productId": "...", "quantity": 999999}]}'
```

**Actual Result**:
Order created with unrealistic quantity

**Expected Result**:
Either validate against available stock or set a reasonable maximum

**Recommended Fix**:
```typescript
const MAX_QUANTITY_PER_ITEM = 100;
if (item.quantity > MAX_QUANTITY_PER_ITEM) {
  return res.status(400).json({
    error: `Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}`
  });
}
```

---

## Tests Passed Summary

The following test categories passed without critical issues:

| Category | Tests | Pass Rate | Notes |
|----------|-------|-----------|-------|
| Authentication (Login) | AUTH-008 to AUTH-012 | 100% | Login flow works correctly |
| Product Discovery | PROD-001 to PROD-021 | 100% | All endpoints functional |
| Farm Discovery | FARM-001 to FARM-005 | 100% | Farm listing works |
| Unified Orders | ORDER-013 to ORDER-021 | 95% | Core flow works (except validation bugs) |
| Subscriptions | SUB-001 to SUB-014 | 90% | Creation works, pause API needs review |
| Trial Boxes | TRIAL-001 to TRIAL-010 | 100% | Including duplicate prevention |
| Farmer Dashboard | FARMER-013 to FARMER-018 | 100% | Order management works |
| Admin Endpoints | ADMIN-001 to ADMIN-005 | 100% | Access control working |
| Role-Based Access | Various | 100% | Non-admin properly rejected |

---

## Fix Implementation Plan

### Phase 1: Critical Fixes (Immediate)
1. **BUG-001 & BUG-002**: Add quantity validation in `order.controller.ts`
   - Estimated effort: 30 minutes
   - Files: `backend/src/controllers/order.controller.ts`

### Phase 2: High Priority Fixes (This Sprint)
2. **BUG-003 & BUG-004**: Add email/password validation in `auth.controller.ts`
   - Estimated effort: 1 hour
   - Files: `backend/src/controllers/auth.controller.ts`

3. **BUG-005**: Decide on subscription pause API design
   - Estimated effort: 2 hours
   - Files: `backend/src/controllers/category-subscription.controller.ts`

### Phase 3: Medium Priority Fixes (Next Sprint)
4. **BUG-006**: Add phone validation
5. **BUG-007**: Add maximum quantity limit

---

## Appendix: Test Environment

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001/api
- **Database**: PostgreSQL via Docker
- **Test Data**: Seeded via `npm run db:seed`

### Test Credentials Used
- Admin: admin@farmbox.tn / admin123
- Farmer: ahmed@fermebensalem.tn / farmer123
- Customer: sonia@example.tn / customer123
