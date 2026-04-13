# Field Estimate Tool

## Overview

Field Estimate Tool is a technician-facing quoting prototype for HVAC service calls. It helps field technicians build a clean on-site estimate by combining customer/property information, one or more service labor lines, and equipment costs into a single workflow.

The goal of the prototype is to reduce the time technicians spend manually looking up prices, remembering labor rules, and assembling estimates while the customer waits.

## Problem

In the current workflow, HVAC technicians often create estimates manually by:
- looking through binders or spreadsheets for equipment pricing
- recalling labor rates from memory
- writing notes by hand
- calling the office to confirm pricing
- sending a more formal estimate later

This process is slow, inconsistent, and unprofessional from the customer’s perspective.

## What I Built

I built a React-based field estimate prototype that allows a technician to:

- search and select a customer
- view property and system details
- add one or more service lines
- choose service type, level, and estimated hours for each service
- search and filter equipment from the catalog
- add equipment quantities to the estimate
- automatically calculate labor subtotal, equipment subtotal, and total estimate
- copy the estimate summary
- export the estimate as a PDF for customer sharing

## Key Design Decisions

### 1. Customer-first workflow
The estimate starts with customer/property selection so technicians can quickly reference:
- address
- property type
- square footage
- system type
- system age
- service history

This reflects how field work typically begins on-site.

### 2. Multiple service lines
A customer may need more than one type of service during a visit, such as:
- diagnostic + repair
- maintenance + repair
- install + ductwork

To reflect that, the prototype supports multiple service lines within a single estimate.

### 3. Equipment kept independent from service type
The provided data includes:
- labor rules in `labor_rates.json`
- equipment catalog entries in `equipment.json`

However, the datasets do not explicitly define which equipment items belong to which service types. To avoid making unsupported assumptions, the prototype allows technicians to select any equipment item regardless of service type.

Service type is used only for labor calculation.

### 4. Use of base cost
The equipment dataset provides `baseCost`, but does not define markup or customer-facing sale price rules. To stay grounded in the provided data, the prototype currently uses `baseCost` directly in estimate calculations.

In a real production system, markup rules would likely be configurable.

### 5. Data normalization
The provided JSON files contain inconsistent field names across records. For example:
- `propertyType` vs `property_type`
- `squareFootage` vs `sqft`
- `baseCost` vs `base_cost`

To handle this, I added a normalization layer so the UI and pricing logic work from one consistent internal schema.

## Tech Stack

- React
- Vite
- JavaScript
- html2pdf.js for PDF export

## Project Structure

```txt
src/
  App.jsx
  data/
    customers.json
    equipment.json
    labor_rates.json
  utils/
    normalizeData.js
    estimateCalculator.js
  components/
    FieldEstimateTool.jsx
    CustomerSelector.jsx
    PropertyDetailsCard.jsx
    ServiceLineCard.jsx
    EquipmentSelector.jsx
    EstimateSummary.jsx
    EstimateQuoteDocument.jsx 
