# Accessibility Style Guide
## Vision Group Uganda Asset Tracker System

This style guide documents the accessibility enhancement classes available in the system and provides guidance on when and how to use them.

---

## Table of Contents

1. [Overview](#overview)
2. [Accessibility Classes](#accessibility-classes)
3. [Usage Guidelines](#usage-guidelines)
4. [Before/After Examples](#beforeafter-examples)
5. [Responsive Behavior](#responsive-behavior)
6. [Best Practices](#best-practices)

---

## Overview

The Vision Group Uganda Asset Tracker System includes three accessibility enhancement classes designed to improve readability for users viewing the interface from a distance (2-4 feet) or users with reduced visual acuity:

- `.form-section-accessible` - For form input sections
- `.guest-modal-accessible` - For guest registration modal
- `.asset-table-accessible` - For data tables

These classes increase font sizes, adjust spacing, and maintain responsive behavior across all devices while ensuring WCAG 2.1 Level AA compliance.

---

## Accessibility Classes

### 1. `.form-section-accessible`

**Purpose:** Enhances form sections with larger text and spacing for improved readability.

**When to Use:**
- Check-in/check-out forms
- Search forms
- Data entry forms
- Any form requiring enhanced visibility for distance viewing

**What It Enhances:**
- Labels: 11px → 22px (+100%)
- Input text: 13px → 28px (+115%)
- Placeholders: 11px → 22px (+100%)
- Buttons: 12px → 20px (+67%)
- Section padding: 20px → 30px
- Element gaps: 15px → 25px

**HTML Example:**
```html
<div class="form-section form-section-accessible">
  <div class="input-grid-3col">
    <div class="input-group">
      <label class="label-standard">Access Card ID</label>
      <input type="text" class="input-standard" placeholder="SCAN CARD" />
    </div>
    <div class="input-group">
      <label class="label-standard">Device Tag</label>
      <input type="text" class="input-standard" placeholder="SCAN DEVICE" />
    </div>
  </div>
  <button class="action-button-full process-btn">Process Transaction</button>
</div>
```

**CSS Variables Used:**
- `--accessibility-label-font-size: 22px`
- `--accessibility-input-font-size: 28px`
- `--accessibility-placeholder-font-size: 22px`
- `--accessibility-button-font-size: 20px`
- `--accessibility-section-padding: 30px`
- `--accessibility-input-padding-vertical: 18px`
- `--accessibility-input-padding-horizontal: 20px`
- `--accessibility-button-padding-vertical: 20px`
- `--accessibility-element-gap: 25px`

---

### 2. `.guest-modal-accessible`

**Purpose:** Enhances the guest registration modal with larger text for improved readability during visitor check-in/check-out.

**When to Use:**
- Guest registration modal
- Visitor management interfaces
- Any modal requiring enhanced visibility for distance viewing

**What It Enhances:**
- Labels: 14px → 20px (+43%)
- Input text: 16px → 24px (+50%)
- Buttons: 13px → 20px (+54%)
- Table text: 14px → 15px (+7%)
- Titles: 20px → 22px (+10%)
- Proportional spacing adjustments

**HTML Example:**
```html
<div class="guest-modal guest-modal-accessible">
  <div class="guest-modal-header">
    <div class="modal-title-section">
      <h2 class="modal-title">Guest Management</h2>
      <p class="modal-subtitle">Register visitor devices</p>
    </div>
  </div>
  
  <div class="guest-modal-content">
    <div class="card-input-container">
      <label class="input-label">Access Card ID</label>
      <input type="text" class="scanner-input" placeholder="SCAN CARD" />
    </div>
    
    <div class="device-list-container">
      <table class="device-table">
        <thead>
          <tr>
            <th>Device Tag</th>
            <th>Serial Number</th>
            <th>Scan Time</th>
          </tr>
        </thead>
        <tbody>
          <!-- Device rows -->
        </tbody>
      </table>
    </div>
    
    <div class="action-toggle-container">
      <button class="action-btn check-in-btn">Check In</button>
      <button class="action-btn check-out-btn">Check Out</button>
    </div>
  </div>
  
  <div class="guest-modal-footer">
    <button class="process-guest-btn">Process Guest</button>
  </div>
</div>
```

**CSS Variables Used:**
- `--guest-modal-label-size: 20px`
- `--guest-modal-input-size: 24px`
- `--guest-modal-button-size: 20px`
- `--guest-modal-table-size: 15px`
- `--guest-modal-title-size: 22px`

---

### 3. `.asset-table-accessible`

**Purpose:** Enhances data tables with larger text for improved readability of transaction records and asset information.

**When to Use:**
- Daily asset register table
- Transaction history tables
- Any data table requiring enhanced visibility

**What It Enhances:**
- Table headers: 10px → 14px (+40%)
- Table body: 12px → 14px (+17%)
- Status badges: 11px → 13px (+18%)
- Proportional cell padding adjustments

**HTML Example:**
```html
<div class="asset-register-section">
  <div class="table-header">
    <h2 class="table-title">Daily Asset Register</h2>
  </div>
  
  <div class="table-container">
    <table class="asset-table asset-table-accessible">
      <thead>
        <tr>
          <th>Time</th>
          <th>Card ID</th>
          <th>Holder Name</th>
          <th>Device Tag</th>
          <th>Status</th>
          <th>Authorized</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>08:30 AM</td>
          <td>VG-12345</td>
          <td>John Doe</td>
          <td>DEV-001</td>
          <td><span class="status-badge in">IN</span></td>
          <td><span class="status-icon authorized">✓</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**CSS Variables Used:**
- `--table-header-font-size-accessible: 14px`
- `--table-body-font-size-accessible: 14px`
- `--table-badge-font-size-accessible: 13px`

---

## Usage Guidelines

### When to Apply Accessibility Classes

**✅ DO use accessibility classes when:**
- The interface will be viewed from 2-4 feet away (security desk scenario)
- Users are 50+ years old or have reduced visual acuity
- The form/modal/table contains critical information requiring quick reading
- The environment has challenging lighting conditions
- Multiple users with varying vision capabilities will use the interface

**❌ DON'T use accessibility classes when:**
- The interface is for close-up viewing (laptop/desktop at normal distance)
- Screen space is extremely limited
- The enhanced sizes cause layout issues that can't be resolved
- Users have explicitly requested standard sizes

### Combining Classes

You can combine accessibility classes with other utility classes:

```html
<!-- Form with accessibility enhancement -->
<div class="form-section form-section-accessible">
  <div class="input-grid-3col">
    <!-- Inputs automatically get enhanced sizes -->
  </div>
</div>

<!-- Table with accessibility enhancement -->
<table class="asset-table asset-table-accessible">
  <!-- Table content automatically gets enhanced sizes -->
</table>
```

### Progressive Enhancement

The accessibility classes are designed as progressive enhancements:

1. **Base styles** provide standard, functional interface
2. **Accessibility classes** enhance readability without breaking functionality
3. **Responsive behavior** ensures usability across all devices

---

## Before/After Examples

### Example 1: Check-In Form

**Before (Standard):**
```html
<div class="form-section">
  <div class="input-grid-3col">
    <div class="input-group">
      <label class="label-standard">Access Card ID</label>
      <!-- Label: 11px, Input: 13px -->
      <input type="text" class="input-standard" />
    </div>
  </div>
  <button class="action-button-full process-btn">Process</button>
  <!-- Button: 12px -->
</div>
```

**Visual Result:**
- Label: 11px (small, difficult to read from distance)
- Input: 13px (requires close viewing)
- Button: 12px (small text)
- Padding: 20px (standard spacing)

**After (Accessible):**
```html
<div class="form-section form-section-accessible">
  <div class="input-grid-3col">
    <div class="input-group">
      <label class="label-standard">Access Card ID</label>
      <!-- Label: 22px, Input: 28px -->
      <input type="text" class="input-standard" />
    </div>
  </div>
  <button class="action-button-full process-btn">Process</button>
  <!-- Button: 20px -->
</div>
```

**Visual Result:**
- Label: 22px (clear, readable from 3+ feet)
- Input: 28px (easily readable from distance)
- Button: 20px (prominent, clear text)
- Padding: 30px (enhanced spacing)

**Improvement:** +100% label size, +115% input size, +67% button size

---

### Example 2: Guest Modal

**Before (Standard):**
```html
<div class="guest-modal">
  <div class="guest-modal-content">
    <label class="input-label">Guest Name</label>
    <!-- Label: 14px, Input: 16px -->
    <input type="text" class="scanner-input" />
    <button class="action-btn">Check In</button>
    <!-- Button: 13px -->
  </div>
</div>
```

**Visual Result:**
- Label: 14px (moderate size)
- Input: 16px (standard modal size)
- Button: 13px (small for distance viewing)
- Table: 14px (standard)

**After (Accessible):**
```html
<div class="guest-modal guest-modal-accessible">
  <div class="guest-modal-content">
    <label class="input-label">Guest Name</label>
    <!-- Label: 20px, Input: 24px -->
    <input type="text" class="scanner-input" />
    <button class="action-btn">Check In</button>
    <!-- Button: 20px -->
  </div>
</div>
```

**Visual Result:**
- Label: 20px (enhanced readability)
- Input: 24px (clear, easy to read)
- Button: 20px (prominent action buttons)
- Table: 15px (improved data visibility)

**Improvement:** +43% label size, +50% input size, +54% button size

---

### Example 3: Asset Register Table

**Before (Standard):**
```html
<table class="asset-table">
  <thead>
    <tr>
      <th>Asset Tag</th> <!-- 10px -->
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>VG-001</td> <!-- 12px -->
      <td><span class="status-badge in">IN</span></td> <!-- 11px -->
    </tr>
  </tbody>
</table>
```

**Visual Result:**
- Headers: 10px (very small, hard to read)
- Body: 12px (small for distance viewing)
- Badges: 11px (difficult to distinguish)

**After (Accessible):**
```html
<table class="asset-table asset-table-accessible">
  <thead>
    <tr>
      <th>Asset Tag</th> <!-- 14px -->
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>VG-001</td> <!-- 14px -->
      <td><span class="status-badge in">IN</span></td> <!-- 13px -->
    </tr>
  </tbody>
</table>
```

**Visual Result:**
- Headers: 14px (clear, readable headers)
- Body: 14px (improved data readability)
- Badges: 13px (clear status indicators)

**Improvement:** +40% header size, +17% body size, +18% badge size

---

## Responsive Behavior

All accessibility classes maintain enhanced readability across different screen sizes:

### Desktop (1280px and above)
- **Full enhanced sizes** applied
- 3-column grid layouts (where applicable)
- Optimal spacing for large screens

**Example:**
```css
.form-section-accessible .label-standard {
  font-size: 22px; /* Full size */
}
```

### Tablet (768px - 1279px)
- **Maintained enhanced sizes**
- Single-column grid layouts
- Adjusted spacing for medium screens
- No horizontal scrolling

**Example:**
```css
@media screen and (min-width: 768px) and (max-width: 1279px) {
  .form-section-accessible .label-standard {
    font-size: 22px; /* Maintained */
  }
  .form-section-accessible .input-grid-3col {
    grid-template-columns: 1fr; /* Single column */
  }
}
```

### Mobile (<768px)
- **Slightly reduced sizes** (10% reduction)
- Single-column layouts
- Minimum 44x44px touch targets
- Optimized for small screens

**Example:**
```css
@media screen and (max-width: 767px) {
  .form-section-accessible .label-standard {
    font-size: 20px; /* Reduced from 22px */
  }
  .form-section-accessible .input-standard {
    font-size: 24px; /* Reduced from 28px */
    min-height: 44px; /* Touch target */
  }
}
```

### Extra Small Mobile (320px - 374px)
- **Further optimized sizes**
- Maintained touch targets
- Compact spacing
- No content overflow

**Example:**
```css
@media screen and (max-width: 374px) {
  .form-section-accessible .label-standard {
    font-size: 18px; /* Further reduced */
  }
  .form-section-accessible .input-standard {
    min-height: 44px; /* Touch target maintained */
  }
}
```

---

## Best Practices

### 1. Apply Classes at Container Level

**✅ Correct:**
```html
<div class="form-section form-section-accessible">
  <label class="label-standard">Name</label>
  <input type="text" class="input-standard" />
</div>
```

**❌ Incorrect:**
```html
<div class="form-section">
  <label class="label-standard form-section-accessible">Name</label>
  <input type="text" class="input-standard form-section-accessible" />
</div>
```

### 2. Use Standard Utility Classes

Always combine accessibility classes with standard utility classes:

```html
<div class="form-section form-section-accessible">
  <div class="input-grid-3col">
    <div class="input-group">
      <label class="label-standard">Field</label>
      <input type="text" class="input-standard" />
    </div>
  </div>
  <button class="action-button-full process-btn">Submit</button>
</div>
```

### 3. Test Across Devices

Always test accessibility enhancements on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet devices (iPad, Android tablets)
- Mobile phones (iPhone, Android phones)
- Different screen sizes (1920px, 1024px, 768px, 375px, 320px)

### 4. Verify Touch Targets

Ensure all interactive elements meet minimum touch target size:
- Minimum: 44x44px (WCAG 2.1 Level AAA)
- Recommended: 48x48px for optimal usability

### 5. Check Keyboard Navigation

Verify that enhanced elements remain keyboard accessible:
- Tab order follows visual layout
- Focus indicators are clearly visible
- All actions can be performed via keyboard

### 6. Maintain Visual Hierarchy

Enhanced sizes should maintain clear visual hierarchy:
- Headings > Labels > Body text
- Primary buttons > Secondary buttons
- Important information > Supporting details

### 7. Consider Context

Apply accessibility classes based on user context:
- **Security desk:** Always use accessibility classes
- **Admin office:** Consider user preference
- **Mobile users:** Accessibility classes adapt automatically
- **Kiosk mode:** Always use accessibility classes

---

## Accessibility Compliance

All accessibility classes ensure WCAG 2.1 compliance:

### Level AA Requirements ✓
- Minimum font size: 14px for body text
- Minimum contrast ratio: 4.5:1
- Resizable text up to 200%
- No loss of content or functionality
- Touch targets: 44x44px minimum

### Level AAA Enhancements ✓
- Minimum font size: 18px for body text (where applicable)
- Minimum contrast ratio: 7:1 (where possible)
- Enhanced spacing and line-height
- Optimal touch targets: 48x48px

### Additional Features ✓
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion support
- Browser zoom support (up to 200%)

---

## Support and Questions

For questions or issues with accessibility classes:

1. Review this style guide
2. Check the design document: `.kiro/specs/font-accessibility-enhancement/design.md`
3. Review requirements: `.kiro/specs/font-accessibility-enhancement/requirements.md`
4. Inspect CSS variables in `css/styles.css`

---

**Last Updated:** January 30, 2026  
**Version:** 1.0  
**Maintained by:** Vision Group Uganda Development Team
