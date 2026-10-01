---
title: "Prompt engineering: how to give an AI instructions it really understands"
description: "Good AI output starts with good instructions. Learn how to use context, roles, constraints, examples and structured output to get more reliable results."
tags: [prompt-engineering, prompting, ai, llm, artificial-intelligence]
date: 2026-11-01 08:00
image: /articles/prompt-engineering/share.jpg
---

## Why doesn't AI do what you asked?

You have probably seen this happen.

You type:

> “Write a good introduction for my company.”

The AI produces a perfectly acceptable but completely generic piece of copy.

You try again:

> “Make it better.”

Another version appears.

Then:

> “Make it more professional, but not too formal.”

That may improve it slightly.

The problem is often not the model itself.

**You simply have not given it enough information to know what “good” means in your particular situation.**

Prompt engineering is not about finding a secret magic phrase.

It is about **defining the task, context, constraints and desired result clearly enough that the model has fewer important things to guess.**

OpenAI, Anthropic and Google all emphasise similar fundamentals in their official guidance: clear instructions, useful context, examples, explicit formatting and iterative refinement. [OpenAI – Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables) [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## A good prompt does not have to be long

This is important.

The goal is not to write a 2,000-word prompt for every request.

For a simple task, one sentence may be enough:

```text
Summarise this text in five short bullet points.
```

A complex task needs more information.

The key questions are:

```text
What should it do?
For whom?
In what context?
Under which rules?
In what format?
How long should it be?
What should it do when information is missing?
```

**A good prompt is not necessarily long. It simply leaves fewer important things ambiguous.**

---

## 1. State the task

One of the most common weak prompts is:

```text
Write something about my website.
```

What does the AI actually know?

Not much.

It does not know:

- what the website is,
- who it is for,
- what the goal is,
- how long the copy should be,
- what tone to use,
- what action you want the reader to take.

A better prompt:

```text
Write a 120-word introduction for a Budapest-based
web development company.

The audience is owners and managers of small and
medium-sized businesses.

The goal is to explain what business problems we can help solve.

Use a professional but approachable tone.
Avoid exaggerated marketing language.
```

OpenAI's official prompting guidance recommends being specific about context, outcome, length, format and style. [OpenAI – Prompting techniques](https://help.openai.com/en/articles/6654000-prompting-techniques)

---

## 2. Add context

AI cannot know everything you know.

If you write:

> “Write a reply to the customer.”

the model does not know:

- who the customer is,
- what happened,
- what you promised,
- how you normally communicate,
- what outcome you want.

Give it the background.

```text
The customer has been working with us for three months.
The project is currently in testing.
Delivery will be two days later than originally planned
because we are fixing an issue with the payment integration.

Write a short, honest email.
Do not shift blame.
Explain when delivery is expected.
```

Google's prompting guidance explicitly recommends providing the contextual information the model needs rather than assuming it already knows the relevant background. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

**The better the model understands the problem, the better it can reason about the task.**

---

## 3. Give it a role when useful

It can help to define a role.

For example:

```text
You are a senior UX designer specialising in B2B web applications.
```

Then:

```text
Review this registration flow.

Identify the points where users might become uncertain
or abandon the process.
```

A role can help the model focus on the right criteria.

Anthropic's official guidance also recommends defining a role, particularly in a system prompt, when you want to establish the desired behaviour and communication style. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

But do not overdo it.

You do not need:

> “You are the world's greatest, award-winning, internationally recognised…”

for every simple question.

**The purpose of a role is focus, not marketing.**

---

## 4. Define constraints

It is useful to tell the AI not only what to do, but what **not** to do.

For example:

```text
Write a 300-word article.

Constraints:
- avoid unnecessary jargon,
- do not make exaggerated claims,
- do not invent statistics,
- do not mention features you have no information about,
- do not use emojis.
```

This is particularly important for business, legal, financial and technical content.

Google's prompt design guidance explicitly treats constraints as part of prompt design. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 5. Define the output

One of the biggest improvements often comes from specifying the desired output.

Weak:

```text
Analyse this customer.
```

Better:

```text
Analyse the customer using this structure:

1. Customer type
2. Main problem
3. Likely business need
4. Risks
5. Recommended next step

Maximum two sentences per section.
```

Google recommends explicit output-format instructions and notes that more complex JSON responses are better handled with structured-output capabilities rather than relying only on prompt wording. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

OpenAI's Structured Outputs feature can constrain model responses to a supplied JSON Schema, making them easier to process reliably in applications. [OpenAI – Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

---

## 6. If software will process the answer, ask for structure

Suppose you want AI to extract customer information from an email.

Do not simply ask:

```text
Tell me what customer information you found in this email.
```

Instead:

```text
Extract customer information from the email.

Return:
{
  "name": "...",
  "email": "...",
  "company": "...",
  "phone": "..."
}

Use null when information is missing.
Never invent missing information.
```

For an API integration, however, it is better to use actual structured output support rather than relying entirely on the model's promise to return valid JSON.

OpenAI's Structured Outputs documentation describes the feature specifically as a way to make model responses conform to a supplied JSON Schema. [OpenAI – Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

---

## 7. Show an example

One of the most effective prompting techniques is **few-shot prompting**.

Instead of only explaining what you want, show it.

For example:

```text
Task:
Turn the sentence into a short, professional customer-support reply.

Example 1:
Input: "I can't log in."
Output: "Sorry about the inconvenience. Please try resetting your password."

Example 2:
Input: "Where can I find my invoice?"
Output: "You can find your invoices under Profile → Invoices."

Now transform:
Input: "I can't download my invoice."
```

Examples teach the model not just the content, but the desired style and structure.

Anthropic's official guidance describes examples as one of the most reliable ways to steer output format, tone and structure. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

**When it is difficult to explain what you want in words, show the model a good example.**

---

## 8. Separate instructions from data

This becomes particularly important with long documents and AI applications.

Instead of:

```text
Summarise this document and don't expose any personal data
The document starts here...
```

use clear boundaries:

```text
# Task

Summarise the document in five points.
Do not expose personal information.

# Document

"""
[document goes here]
"""
```

Or:

```text
<instructions>
Summarise the document in five points.
Do not expose personal information.
</instructions>

<document>
[document goes here]
</document>
```

OpenAI's official documentation recommends Markdown and XML structures to make logical boundaries between instructions, examples and context clearer. [OpenAI – Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)

Anthropic similarly recommends XML tags for complex prompts where instructions, context and examples are mixed together. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

---

## 9. Break complex tasks into steps

Consider this request:

> “Analyse the business, identify its problems, create a marketing strategy, prepare a budget and turn it into a presentation.”

That is several different tasks bundled together.

A clearer version:

```text
1. Identify the company's main problems.
2. Rank them by business impact.
3. Suggest possible solutions.
4. Create an implementation plan.
5. Turn the plan into a presentation outline.
```

Anthropic's guidance recommends numbered or bulleted instructions when sequence or completeness matters. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

---

## Bad prompt → better prompt

Let's look at a few common examples.

### Example 1: “Write a good article”

**Bad:**

```text
Write a good article about artificial intelligence.
```

**Better:**

```text
Write a 1,000-word article for SME owners
about practical uses of AI.

Goal:
Explain which business processes can genuinely benefit from AI.

Style:
- professional but approachable
- practical rather than hype-driven
- explain technical terms in plain English

Structure:
- short introduction
- five practical examples
- risks
- when AI should not be used
- short conclusion

Do not invent statistics.
```

---

## Example 2: “Analyse this”

**Bad:**

```text
Analyse this business plan.
```

**Better:**

```text
Analyse the following business plan from an SME
consulting perspective.

Evaluate:
1. target market
2. revenue model
3. cost structure
4. major risks
5. scalability

For each section:
- give a short assessment,
- provide evidence from the document,
- say when there is not enough information.

Finish with five clarification questions.

<business_plan>
[text]
</business_plan>
```

You are no longer simply saying “analyse it”.

**You have defined what analysis means.**

---

## Example 3: “Write some code”

**Bad:**

```text
Write a login system in Java.
```

**Better:**

```text
Create a REST API login module for a Spring Boot 3
application using Java 17.

Requirements:
- use Spring Security
- use JWT authentication
- securely hash passwords
- do not reveal whether a user exists when login fails
- use DTOs
- include unit tests

Output:
1. required classes
2. Java code
3. configuration
4. tests
5. short security notes

If a requirement is ambiguous,
state the assumption before the code.
```

For development tasks, environment and technical constraints matter enormously.

**“Write some code” is not a specification.**

---

## Example 4: “Make this more professional”

**Bad:**

```text
Make this email more professional.
```

**Better:**

```text
Rewrite this email in a professional but approachable tone.

Goal:
Get the customer to accept that delivery will be three days late.

Constraints:
- do not shift blame,
- avoid legalistic or overly formal language,
- maximum 150 words,
- keep the tone friendly.

Original:
"""
...
"""
```

The AI no longer has to guess what “professional” means.

**You have defined it.**

---

## Do not give contradictory instructions

For example:

```text
Be extremely detailed.

Keep the answer under 100 words.

Explain every detail.

Do not write a long answer.
```

That is a poor specification.

If you have several requirements, make their priorities clear:

```text
Keep the answer under 100 words.
Highlight the three most important points.
Do not include background explanation.
```

**A model cannot reliably follow a specification that contradicts itself.**

---

## Do not rely on magic words

The internet is full of prompts containing lines such as:

> “You are now the greatest expert in the world.”

> “This is the most important task of your life.”

> “If you fail, something terrible will happen.”

These are generally less useful than something concrete:

```text
Write for a senior backend developer.
Use concise technical explanations.
Use Spring Boot 3 and Java 17 in all examples.
```

**A concrete requirement is more useful than dramatic wording.**

---

## Prompt engineering is iterative

Your first prompt will rarely be perfect.

A useful process is:

```text
Prompt
↓
Result
↓
What was wrong?
↓
Revised prompt
↓
New result
↓
Test
↓
Refine
```

OpenAI and Google both describe prompting as an iterative process rather than a one-time recipe. [OpenAI – Prompting](https://developers.openai.com/api/docs/guides/prompting) [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

Anthropic's prompt engineering overview also recommends defining success criteria and an evaluation approach before spending time optimising prompts. [Anthropic – Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)

---

## Good prompts need testing too

If an AI system is part of a business process, do not test it with only one example.

Create several test cases:

```text
Normal case
↓
Simple edge case
↓
Missing data
↓
Invalid data
↓
Unusual wording
↓
Conflicting information
↓
Irrelevant input
```

For a customer-support assistant, it is not enough to check whether it answers a normal question correctly.

You also need to know what happens when the customer:

- does not provide an order number,
- provides the wrong order number,
- mentions several orders,
- gives incomplete information,
- asks about something that is not in the knowledge base.

**Prompt quality should not be judged by whether one response happened to look good.**

---

## A practical prompt template

If you do not know where to start, try this:

```text
# Role
[Who are you?]

# Goal
[What needs to be achieved?]

# Context
[What information is needed?]

# Task
[What exactly should be done?]

# Constraints
[What should and should not happen?]

# Examples
[1–3 good examples]

# Output
[Format and length]

# Input
[Current data or request]
```

You do not need all seven sections every time.

A simple question may need only two sentences.

A complex business AI system may benefit greatly from this kind of structure.

Google's official guidance provides similarly structured templates that separate role, instructions, context, constraints and output format. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## The most important rule

Good prompting is not about finding the “perfect sentence”.

It is about **leaving as little important information as possible for the model to guess.**

If something matters:

- say it,
- if the format matters, show it,
- if there is a constraint, write it down,
- if context matters, provide it,
- if there is a good example, show it,
- if software will process the answer, use structured output,
- if it is part of a business process, test it with multiple inputs.

Prompt engineering is therefore not really about “tricking AI”.

**It is about writing a good specification for a system that understands instructions through natural language.**

And the more important the task, the more you should think of the prompt as a specification rather than a casual question.

**softwaredevelopment.hu — AI integration, automation and custom AI solutions for businesses.**

---

## Sources

- OpenAI: [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- OpenAI: [Prompting](https://developers.openai.com/api/docs/guides/prompting)
- OpenAI Help Center: [Best practices for prompt engineering with the OpenAI API](https://help.openai.com/en/articles/6654000-prompting-techniques)
- OpenAI: [Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- Anthropic: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Anthropic: [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- Google AI for Developers: [Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- Google AI for Developers: [Prompting best practices](https://ai.google.dev/gemini-api/docs/prompting-strategies)
