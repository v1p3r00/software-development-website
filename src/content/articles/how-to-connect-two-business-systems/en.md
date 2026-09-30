---
title: "How can you connect two separate business systems?"
description: "APIs, webhooks, middleware, Zapier, Make or custom development? A practical guide to connecting separate business systems."
tags: [api, webhook, automation, integration, business]
date: 2026-10-11 08:00
image: /articles/how-to-connect-two-business-systems/share.jpg
---

Imagine you run an online shop, a CRM and an invoicing system.

A new order arrives in the shop. Someone needs to get the customer and order details into the invoicing system, update the CRM and perhaps notify a colleague.

You can do all of that manually.

But when you have dozens or hundreds of orders, another question becomes more important:

> **Why should people manually copy the same information between systems?**

That is where integration comes in.

---

## What does it actually mean to connect two systems?

Integration simply means that two separate systems can exchange information.

For example:

```text
Online shop
   ↓
New order
   ↓
Integration
   ↓
Invoicing system
   ↓
Invoice created
   ↓
CRM updated
```text

The two systems do not necessarily have to communicate directly.

There may be a middleware or iPaaS platform in between them.

Common approaches include:

- APIs
- webhooks
- middleware or iPaaS platforms such as Zapier or Make
- file-based data exchange
- custom integration development

Each approach has its place.

---

## 1. API – when systems communicate directly

An API provides a structured way for one system to request or change information in another system.

For example, an online shop might send:

```text
POST /invoices

{
  "customer": "Peter Smith",
  "email": "peter@example.com",
  "amount": 125000
}
```text

The invoicing system processes the request and returns a response.

That response can indicate whether the request succeeded, whether the supplied data was invalid, or whether the target system encountered an error. HTTP defines separate classes for successful 2xx responses, client errors in the 4xx range and server errors in the 5xx range. [RFC 9110 – HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

### When is an API a good choice?

APIs are particularly useful when:

- data needs to move immediately,
- you need two-way communication,
- there is significant business logic,
- you are dealing with larger volumes of data,
- you need precise control over the integration.

### The downside

API integrations usually require technical development.

And knowing that an API exists is not enough. You need to understand its documentation, authentication, rate limits, supported operations, versions and error handling.

---

## 2. Webhooks – when a system tells you something happened

With an API, you often ask another system:

> “Has a new order been created?”

A webhook reverses the direction.

The system sends a notification when an event happens.

For example:

```text
New order
    ↓
Shop webhook
    ↓
POST /webhooks/order-created
    ↓
Integration
    ↓
CRM + invoicing
```text

Make describes webhooks as HTTPS requests that can trigger a scenario when data arrives. Webhooks can be used as immediate triggers rather than repeatedly polling a service for new information. [Make – Webhooks](https://help.make.com/webhooks?v=2)

### When are webhooks useful?

For example:

- a new order is created,
- a customer registers,
- a payment succeeds,
- an order status changes,
- a document is generated,
- a new lead arrives.

A webhook is not necessarily the complete integration. It is often the event that starts the next part of the process.

---

## 3. Zapier or Make – when you do not want to build everything yourself

If the systems already have ready-made integrations, you may not need to build your own backend.

An iPaaS or workflow platform can sit between the systems:

```text
Online shop
   ↓
New order
   ↓
Make / Zapier
   ↓
Update CRM
   ↓
Create invoice
   ↓
Send email
```text

Zapier can receive webhook requests from external systems and also send webhook requests to external URLs and APIs. [Zapier – Trigger Zaps from webhooks](https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks) · [Zapier – Send webhooks in Zap workflows](https://help.zapier.com/hc/en-us/articles/8496326446989-Send-webhooks-in-Zap-workflows)

Make provides similar webhook-driven workflows. [Make – Webhooks](https://help.make.com/webhooks?v=2)

### Advantages

- quick to build,
- little custom code,
- many ready-made connectors,
- often cheaper than custom development for simple workflows,
- easier for non-developers to understand and maintain.

### Disadvantages

The more complicated the workflow becomes, the harder it can be to maintain.

This is simple:

```text
New order → CRM → email
```text

But this is considerably more complex:

```text
New order
 → find customer
 → check for duplicates
 → check stock
 → create invoice
 → verify payment
 → update CRM
 → retry on failure
 → notify someone if it still fails
```text

At this point, it is worth considering whether a more controlled custom integration would make more sense.

---

## 4. File-based integration – sometimes the simplest answer

Not every business system has a useful API.

You may still be able to exchange information using:

- CSV files,
- XML,
- JSON,
- Excel exports,
- SFTP.

For example:

```text
ERP
 ↓
CSV export
 ↓
SFTP / upload
 ↓
Other system
 ↓
Import
```text

This is less sophisticated than a real-time API integration, but that does not necessarily make it a bad solution.

If accounting data only needs to be transferred once per day, real-time synchronisation may provide little additional business value.

**An integration should not be considered good because it is technically fashionable. It should be considered good because it fits the business process.**

---

## 5. Custom integration – when you need more control

With custom development, you decide exactly how the systems communicate.

For example:

```text
Online shop API
       ↓
Custom integration service
       ↓
Data transformation
       ↓
CRM API
       ↓
Invoicing API
```text

This can make sense when:

- there is no ready-made connector,
- there are many business rules,
- several systems need to be connected,
- data volumes are significant,
- you need full control,
- the process is business-critical.

The downside is obvious: someone has to develop, test, operate and maintain it.

A change to an external API can also require changes to your integration.

---

## Which approach should you choose?

There is no universal answer.

A simple decision process might look like this:

```text
Is there a ready-made integration?
    ↓ yes
Use it

    ↓ no

Is there an API or webhook?
    ↓ yes
API / webhook / iPaaS

    ↓ no

Is there regular export/import?
    ↓ yes
File-based integration

    ↓ no

Custom development
```text

For a simple CRM → email workflow, Make or Zapier may be perfectly adequate.

For an online shop → ERP → invoicing → logistics workflow, it is worth thinking more carefully about the architecture.

---

## The difficult part is not sending the data

The first version of an integration is usually easy to describe:

> “When an order is created, send it to the other system.”

The more important question is:

> **What happens when something goes wrong?**

For example:

- the target system is unavailable,
- a timeout occurs,
- invalid data is received,
- a required field is missing,
- the same event arrives twice,
- an API rate limit is reached,
- the API version changes.

For this reason, error handling is just as important as data transfer when designing a business integration.

---

## What happens if the same order arrives twice?

This is a classic integration problem.

Imagine that the shop sends:

```text
Order #12345
```text

The invoicing system receives it and creates the invoice.

But the response gets lost.

The shop therefore sends the order again.

If the target system cannot recognise that this is the same request, you could end up with a duplicate invoice or duplicate record.

This is why **idempotency** matters: processing the same operation more than once should not create an unintended second business operation.

Microsoft and AWS architecture guidance both cover idempotent processing and safe retry strategies. [Microsoft – Retry pattern](https://learn.microsoft.com/th-th/azure/architecture/patterns/retry) · [AWS – Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)

---

## Retry, but do not retry forever

If the other system is temporarily unavailable, retrying the request can make sense.

For example:

```text
Attempt 1 → failed
        ↓
wait
        ↓
Attempt 2 → failed
        ↓
wait
        ↓
Attempt 3 → successful
```text

The retry strategy should be controlled.

Microsoft recommends considering factors such as idempotency, latency and the risk that aggressive retries can create additional load on the affected systems. [Microsoft – Recommendations for handling transient faults](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/handle-transient-faults)

If an operation continues to fail, you may need a separate failure queue or dead-letter queue so that failed messages can be investigated and processed again later. [AWS – Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)

---

## Do not just make it work – make it observable

An integration is much more useful when you can see what is happening.

At a minimum, you should be able to answer:

- when did the process run?
- did it succeed?
- which record did it process?
- what went wrong?
- how many times was it retried?
- which system returned the error?

When several systems are involved, a shared identifier such as a correlation ID can make a transaction traceable across the entire chain. [Microsoft – Microservices assessment and readiness](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment)

**When an integration fails, the first step should not be asking someone, “Any idea what happened?”**

The system should ideally be able to tell you.

---

## A good integration does not have to be complicated

For a small business, building a dedicated integration layer may be completely unnecessary.

You might only need:

```text
Online shop
   ↓
Make
   ↓
CRM
```text

In another situation, using Zapier or Make may introduce too many compromises.

For example, connecting a complex ERP with several business applications may justify a dedicated integration layer.

The question is therefore not:

> **“Which technology is the most modern?”**

It is:

> **“What data needs to move, how often, how reliably and with what consequences if something goes wrong?”**

Once you answer that, choosing the technology becomes much easier.

---

## Questions to answer before building an integration

It is worth going through this checklist:

- Which system is the source?
- Which system is the destination?
- Exactly what data needs to be transferred?
- What event starts the process?
- Does the data need to arrive immediately?
- Is there an API?
- Is there a webhook?
- Is there a ready-made integration?
- What authentication is required?
- What happens when something fails?
- Can the same record be processed twice?
- How can a failed transaction be traced?
- Who is notified if the integration stops?
- What happens if one system changes its API?

These questions are best answered before development starts.

---

## The goal is not to connect everything to everything

It is easy for a business to end up with every system connected directly to several others.

You can quickly get something like this:

```text
CRM ───── ERP
 │ ╲       ╱ │
 │  ╲     ╱  │
Shop ──────── Invoicing
 │             │
 └──── API ────┘
```text

The more connections you have, the more places there are to maintain, monitor and update.

**The goal of integration is not to have more technology. It is to reduce manual work and prevent avoidable errors.**

If a connection does not solve a real business problem, you may not need it at all.

---

## The most important question

> **Do you have two systems between which your team regularly moves the same information by hand?**

Start by checking whether there is an API, webhook or ready-made integration. That often tells you whether the problem can be solved with a simple workflow or whether custom development is justified.

If the integration is business-critical, however, simply making the data move is not enough. Error handling, retries, duplicate processing and monitoring all need to be considered.

**softwaredevelopment.hu — A good integration is not simply one that connects two systems. It is one that keeps them connected reliably.**

---

## Sources

- MDN: [API – Glossary](https://developer.mozilla.org/en-US/docs/Glossary/API)
- Make: [Webhooks](https://help.make.com/webhooks?v=2)
- Zapier: [Trigger Zaps from webhooks](https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks)
- Zapier: [Send webhooks in Zap workflows](https://help.zapier.com/hc/en-us/articles/8496326446989-Send-webhooks-in-Zap-workflows)
- RFC Editor: [RFC 9110 – HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- Microsoft Learn: [Retry pattern](https://learn.microsoft.com/th-th/azure/architecture/patterns/retry)
- Microsoft Learn: [Recommendations for handling transient faults](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/handle-transient-faults)
- Microsoft Learn: [Microservices assessment and readiness](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment)
- AWS Prescriptive Guidance: [Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)
- AWS Prescriptive Guidance: [Publish-subscribe pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/publish-subscribe.html)
````
