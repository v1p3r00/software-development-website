---
title: "From Excel to a business system: when has a company outgrown its spreadsheets?"
description: "When does Excel become a business risk? Learn the warning signs and how to move from spreadsheets to SaaS, low-code or custom software."
tags: [excel, digitalisation, automation, saas, business-system]
date: 2026-10-12 08:00
image: /articles/from-excel-to-a-business-system/share.jpg
---

Excel is a fantastic tool.

For a new business, it is often exactly what you need. You can quickly manage customers, products, costs, orders or projects without buying or building a dedicated system.

The problem usually does not start when someone uses Excel.

It starts when **more and more business processes begin to depend on Excel.**

First there is one spreadsheet.

Then there are three.

Then someone creates a copy:

```text
customers.xlsx
customers_final.xlsx
customers_final2.xlsx
customers_FINAL.xlsx
customers_FINAL_fixed.xlsx
```

At some point, Excel is no longer helping the business.

**The business is adapting itself around the limitations of Excel.**

---

## Excel itself is not the problem

This distinction matters.

A process is not automatically bad just because it uses Excel.

If one employee creates a simple report once a month, there may be no reason to replace it with a dedicated business system.

Modern Excel also supports co-authoring in the right Microsoft 365 environment. Microsoft documents how multiple people can work on the same workbook and, in supported versions, review changes. [Microsoft – Collaborate on Excel workbooks](https://support.microsoft.com/en-us/excel/get-started/collaborate-on-excel-workbooks-at-the-same-time-with-co-authoring)

So the real question is not:

> **“Do we use Excel?”**

It is:

> **“Is Excel still the right tool for this process?”**

---

## 1. There are multiple versions of the same data

This is one of the most common warning signs.

If someone emails an Excel file to another person, that person edits it and sends it back, you can quickly end up with multiple versions of the same information.

If several people work on separate copies, it becomes difficult to know which one is the actual source of truth.

Modern Excel supports co-authoring, but it requires the appropriate version, Microsoft 365 and a suitable storage environment. Older Excel versions do not support co-authoring. [Microsoft – Excel file is locked for editing](https://support.microsoft.com/en-us/excel/excel-file-is-locked-for-editing)

If your everyday process still looks like this:

```text
Peter → Excel
        ↓
email
        ↓
Anna → Excel
        ↓
email
        ↓
John → Excel
```

then it is worth asking whether everyone should be working on the same data in a shared business system instead.

---

## 2. One wrong cell can cause a serious problem

One of Excel's greatest strengths is its flexibility.

That is also one of its weaknesses.

A user can easily:

- overwrite a value,
- delete a row,
- overwrite a formula,
- enter data in the wrong format,
- change a calculation,
- copy a formula incorrectly.

Microsoft provides worksheet, cell and formula protection features, while also making clear that worksheet protection should not be treated as a complete security solution. [Microsoft – Protection and security in Excel](https://support.microsoft.com/en-us/excel/protection-and-security-in-excel)

A dedicated business system can instead define roles such as:

```text
Sales employee
  → can create customers
  → can edit prices

Manager
  → can approve prices
  → can create reports

Administrator
  → manages users
```

**Not every employee needs access to every piece of data or every operation.**

---

## 3. Nobody knows exactly who changed something

This becomes particularly important with financial, customer or stock data.

Excel does have change-tracking capabilities, but what you can track depends on the Excel version, file format and workflow. Microsoft notes, for example, that changes made using certain older or one-time-purchase versions of Excel may not appear in the modern Show Changes view. [Microsoft – Get help with Show Changes in Excel](https://support.microsoft.com/en-gb/excel/get-help-with-show-changes-in-excel)

In a dedicated business system, however, auditing can be designed into the application:

```text
30 September 2026, 10:32
Anna Smith
Customer: #1245
Status:
"Quote" → "Order"
```

An audit trail is not necessary for every business.

But when you need one, it is often too late to discover that the existing spreadsheet was never designed for that purpose.

Event logging and auditability are established practices in information-security controls as well. [NIST – Audit and Accountability](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/800-171r3/NIST.SP.800-171r3.html)

---

## 4. The same data has to be entered several times

This may be an even stronger warning sign.

For example, a new customer arrives:

```text
Website
   ↓
Excel
   ↓
CRM
   ↓
Invoicing system
   ↓
Project spreadsheet
   ↓
Email
```

If the same information has to be entered manually into several systems, you are not just wasting time.

**Every manual copy is another opportunity for an error.**

A name can be misspelled.

A phone number can be left out.

A price can be copied incorrectly.

A status can be forgotten.

A well-designed system can allow data to be entered once and then shared with the systems that need it.

---

## 5. Several people now depend on the same spreadsheet

When one person manages an Excel file, many problems simply do not appear.

Once sales, finance, customer service and management all depend on the same data, the requirements change.

Who can edit what?

Who can see what?

Who can approve something?

What happens when two people change the same information?

What happens when someone leaves the company?

Microsoft 365 Excel provides collaboration and access-control features, but these do not necessarily replace a business system designed around roles, workflows and business rules. [Microsoft – Best practices for coauthoring](https://support.microsoft.com/en-us/excel/get-started/best-practices-for-coauthoring-in-excel)

---

## 6. The Excel file has become “the business”

This is one of the best tests.

Imagine someone says:

> “If this Excel file disappeared, one of our business processes would basically stop.”

That is a serious warning sign.

Not necessarily because Excel is technically bad.

But because **a business-critical process has become dependent on a single file.**

At this point, ask:

- where is the data stored?
- who has access?
- what backups exist?
- how are changes tracked?
- can previous states be restored?
- how is data quality maintained?

---

## 7. When should you move away from Excel?

There is no rule saying that you must replace Excel after reaching a certain number of employees.

Company size alone is not a useful measure.

A five-person business can outgrow Excel for a complex process.

A 50-person business may still use it perfectly well for certain tasks.

Better questions include:

- How many people use it?
- How many processes depend on it?
- How many places contain the same data?
- How much manual copying happens?
- How often do errors occur?
- What does an error cost?
- Do you need user permissions?
- Do you need an audit trail?
- Do you need automated reporting?
- Do you need API integrations?
- What happens when the person who knows the process is unavailable?

If the answers are becoming increasingly uncomfortable, it may be time for the next step.

---

## You do not necessarily need custom software

When a business outgrows Excel, many people immediately think about building their own application.

There are actually at least three common paths.

### 1. Off-the-shelf SaaS

An existing subscription-based business application.

For example:

- CRM,
- project management,
- inventory management,
- ERP,
- invoicing,
- helpdesk.

**Advantage:** faster implementation.

**Disadvantage:** you have to work within the product's way of doing things.

This is often a good option when your business process is reasonably close to an existing product's model.

---

## 2. Low-code / no-code

Low-code tools allow businesses to build applications and workflows with less traditional programming.

They can be particularly useful for internal processes:

```text
Form
  ↓
Database
  ↓
Approval
  ↓
Notification
  ↓
Report
```

The advantage is speed.

The downside is that platform limitations and long-term costs can become important.

So do not choose low-code simply because it is quicker to build.

Consider the whole lifecycle.

---

## 3. Custom development

If your business process is highly specific, custom software may make sense.

For example:

```text
Website
   ↓
Custom business system
   ├── customers
   ├── projects
   ├── tasks
   ├── documents
   └── reports
          ↓
       invoicing
```

The advantage is that the software can be designed around your actual process.

The downside is that you take on development, operation and maintenance responsibilities.

**The goal is not for every business to have its own software.**

The goal is to use the right tool for the business process.

---

## How should you migrate?

One of the biggest mistakes is trying to replace the entire Excel ecosystem in one go.

You do not need to.

### Step 1: Map the process

Do not start with the spreadsheet.

Start with the process.

For example:

```text
Lead arrives
   ↓
Salesperson records it
   ↓
Quote created
   ↓
Customer accepts
   ↓
Project starts
   ↓
Invoicing
```

Then identify where Excel is currently being used.

---

## Step 2: Identify the source of truth

If the same customer appears in five different spreadsheets, you need to decide:

> **Which system should contain the official customer record?**

This is often more important than the technology itself.

For example:

```text
Customer
   ↓
CRM = official record
   ↓
Project
   ↓
Invoicing
```

Other systems can receive the information from there.

---

## Step 3: Do not build everything at once

The first version may only need:

- customer management,
- statuses,
- search,
- permissions,
- basic reporting.

The advanced dashboard can wait.

AI can wait.

A mobile app can wait.

Twenty-five different notifications can wait.

**Solve the problem that made you outgrow Excel first.**

---

## Step 4: Clean the data

This is one of the most important parts of migration.

Your Excel files may contain:

- duplicate customers,
- missing information,
- inconsistent names,
- old records,
- invalid phone numbers,
- different date formats.

For example:

```text
ABC Ltd
ABC LTD
ABC Ltd.
Abc Ltd
```

A person will probably understand that these refer to the same company.

A database will not necessarily do so automatically.

**Do not simply copy the old Excel mess into a new system.**

Clean the data first.

---

## Step 5: Run the new system alongside the old process

During migration, a short transition period can be useful.

```text
Excel
  ↓
data import
  ↓
New system
  ↓
testing
  ↓
validation
  ↓
live use
```

For a while, you can check whether the new system produces the expected results.

Once everything is stable, Excel can gradually disappear from the active workflow.

---

## Step 6: Do not necessarily delete the old files immediately

Archive them.

Not because people should continue using them.

But because historical information may still be useful and you may need to refer back to it.

The active business process, however, should eventually run in the new system.

---

## How much does the transition cost?

There is no universal price.

A simple internal process may be handled by an existing SaaS product without any custom development.

A low-code application depends on the platform and the amount of implementation work required.

A custom business system can become a much larger software project.

As a **guide price** for a Hungarian small-business environment, a simple custom internal system covering a few business processes might be in the region of **€1,300–€5,100**, using a purely illustrative conversion of the example Hungarian range above. More complex systems can cost considerably more.

This is not a market price list.

The more useful question is:

> **How much is the spreadsheet costing you today?**

Do not only count the software itself.

Include:

- manual data entry,
- fixing errors,
- lost information,
- time spent preparing reports,
- duplicated work,
- delays in business decisions.

Excel may appear to be “free”.

The work built around it certainly is not.

---

## You do not have to stop using Excel

This is important too.

A business can continue using Excel even after introducing a CRM, ERP or internal business system.

For example:

```text
Business system
       ↓
data export
       ↓
Excel analysis
       ↓
management report
```

Excel is then an analysis tool.

It is no longer the company's primary database.

**Excel does not necessarily disappear. Its role changes.**

---

## The real question is not “Excel or a system?”

It is:

**Which tool is appropriate for which task?**

Excel:

- quick calculations,
- analysis,
- one-off reports,
- ad-hoc tasks.

Business system:

- shared database,
- permissions,
- workflows,
- audit trail,
- automation,
- integrations,
- multiple users.

The two can work together.

---

## The most important question

> **If the employee who knows your Excel process best were unavailable for two weeks tomorrow, would the business continue operating normally?**

If the answer is no, you may no longer simply have an Excel file.

You have a business process whose operation is hidden inside one person's knowledge and one spreadsheet.

That does not mean you immediately need a multi-million-forint enterprise system. Start by mapping the process, understanding the data and identifying the actual problems. Then decide whether an off-the-shelf SaaS product, low-code solution or custom software is appropriate.

**softwaredevelopment.hu — Excel is not the enemy. It becomes a problem when you are trying to run an entire business process from a spreadsheet.**

---

## Sources

- Microsoft: [Collaborate on Excel workbooks at the same time with co-authoring](https://support.microsoft.com/en-us/excel/get-started/collaborate-on-excel-workbooks-at-the-same-time-with-co-authoring)
- Microsoft: [Excel file is locked for editing](https://support.microsoft.com/en-us/excel/excel-file-is-locked-for-editing)
- Microsoft: [Protection and security in Excel](https://support.microsoft.com/en-us/excel/protection-and-security-in-excel)
- Microsoft: [Get help with Show Changes in Excel](https://support.microsoft.com/en-gb/excel/get-help-with-show-changes-in-excel)
- Microsoft: [Best practices for coauthoring in Excel](https://support.microsoft.com/en-us/excel/get-started/best-practices-for-coauthoring-in-excel)
- Microsoft: [Restrict changes to files in Excel](https://support.microsoft.com/en-us/excel/restrict-changes-to-files-in-excel)
- NIST: [Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/800-171r3/NIST.SP.800-171r3.html)
- European Commission: [Digital Decade 2025 – Digitalisation of Business in the EU Member States](https://digital-strategy.ec.europa.eu/en/library/digital-decade-2025-digitalisation-business-eu-member-states)
- European Commission: [Commission reports show continued growth of European SMEs](https://single-market-economy.ec.europa.eu/news/commission-reports-show-continued-growth-european-smes-and-highlight-challenges-women-entrepreneurs-2026-06-22_en)
