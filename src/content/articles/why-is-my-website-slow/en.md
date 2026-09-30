---
title: "Why is my website slow? The most common technical causes"
description: "Is your website slow? Learn the most common technical causes, from hosting and images to JavaScript, databases, caching and CDNs."
tags: [website, performance, pagespeed, development, seo]
date: 2026-10-04 08:00
image: /articles/why-is-my-website-slow/share.jpg
---

When a website feels slow, it is tempting to blame the hosting company or simply say that there is "too much stuff" on the page.

The reality is usually more complicated.

The server might be responding slowly. A single oversized image might be delaying the most important content. Too much JavaScript might be keeping the browser busy. A plugin might load unnecessary code on every page. Or a database query might be making the server wait before it can return anything.

There is another possibility: the page may technically load quite quickly, but still feel slow because buttons respond late or the layout jumps around while content appears.

**That is why website performance should not be reduced to a single PageSpeed score.**

Google's PageSpeed Insights combines lab analysis with real-user data where available, making it a useful starting point for understanding where performance problems may exist. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

---

## First: what does "slow" actually mean?

A slow website can have several different problems.

### The server is slow

The browser sends a request, but waits a long time for the first response.

```text
Browser → server → database → application → HTML
                            ↑
                       long wait
```text

### The browser is slow

The server has already sent the page, but the browser has too much JavaScript, CSS or other work to process.

```text
Server → HTML + JS + CSS → browser → processing → usable page
                                    ↑
                                too much work
```text

### The resources are slow

The HTML arrives quickly, but a large image, stylesheet or third-party script takes a long time to download.

The first step is therefore to find **where the waiting actually happens**.

---

## 1. Poor or badly configured hosting

The simplest explanation is sometimes the server itself.

On an inexpensive or heavily shared hosting environment, multiple websites may compete for the same resources. Traffic spikes or activity from other sites can affect response times.

But slow server response does not automatically mean that you need better hosting.

Response time can also depend on:

- server load,
- the runtime environment,
- application code,
- database performance,
- network conditions,
- caching,
- server location.

web.dev's performance guidance treats server response time and browser-side processing as separate parts of the overall performance picture. ([web.dev – Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path))

### What should you do?

Do not switch hosting immediately.

First establish whether the server is actually the bottleneck.

If a simple static page responds quickly but a database-driven page is slow, the application or database may be the real problem.

**A more expensive server will not automatically fix inefficient application code.**

---

## 2. Your images are far too large

This is one of the most common and easiest problems to fix.

Modern phones and cameras can produce image files that are several megabytes in size. A website often needs only a fraction of that data.

If you upload a 5,000-pixel-wide photograph and display it at 800 pixels wide, the browser may still have to download the much larger file.

web.dev describes images as one of the largest resource categories on the web, meaning image optimisation can have a significant impact on performance. ([web.dev – Image performance](https://web.dev/learn/performance/image-performance))

### What should you do?

- Serve images at appropriate dimensions.
- Compress them.
- Use modern image formats where appropriate.
- Use responsive images.
- Delay loading images that are below the initial viewport.

The `loading="lazy"` attribute can prevent images outside the initial viewport from being downloaded immediately. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

There is an important exception, however: **do not automatically lazy-load the main image visible at the top of the page**, because delaying that image can make the most important content appear later. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

---

## 3. Too much JavaScript

JavaScript makes websites interactive.

Menus, animations, forms, shopping baskets, calculators, analytics and many other features depend on it.

The problem starts when JavaScript is used for almost everything.

A simple company website, for example, may not need dozens of scripts running on every page.

web.dev notes that shipping too much JavaScript can slow page loading and make interactions less responsive. ([web.dev – Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading))

The browser does not just download JavaScript.

It also has to parse it, compile it and execute it.

### What should you do?

Check:

- which JavaScript files are loaded,
- which ones are actually needed,
- which ones are loaded on every page,
- whether libraries are duplicated,
- whether some scripts can be delayed,
- whether unused code can be removed.

**JavaScript is not the problem. Unnecessary JavaScript is.**

---

## 4. Too many plugins and third-party services

This is especially common with websites built on ready-made platforms.

One plugin handles contact forms.

Another handles cookies.

Another provides analytics.

Another adds chat.

Another adds animations.

Eventually, every plugin contributes something to the page load.

Third-party JavaScript can be particularly difficult because it is usually served from systems outside your direct control. It can affect performance as well as privacy, security and page behaviour. ([web.dev – Third-party JavaScript performance](https://web.dev/articles/third-party-javascript))

### What should you do?

Review your plugins periodically.

Ask:

> Do we still actually use this?

If the answer is no, remove it.

If two plugins perform the same job, consider whether you really need both.

And if a small feature can be implemented without loading a large library, there may be no reason to add the library.

---

## 5. Slow database queries

This problem is less visible but can be very important for web applications.

Imagine a customer opens a page.

The server needs to retrieve:

- customer information,
- orders,
- products,
- prices,
- permissions.

If one of those queries is slow, the whole page may wait.

```text
HTTP request
   ↓
Backend
   ↓
SQL query
   ↓
database waits
   ↓
Backend
   ↓
HTML / JSON
   ↓
Browser
```text

The visitor does not see the SQL query.

They simply see a page that seems to be doing nothing.

### What can cause it?

For example:

- missing database indexes,
- inefficient SQL,
- retrieving too much data,
- sequential queries,
- unnecessary JOINs,
- N+1 query problems,
- poor filtering on large tables.

### What should you do?

This is not something an image compression plugin can solve.

A developer needs to measure which queries take the most time and why.

**If the database is making the server wait, redesigning the frontend will not solve the underlying problem.**

---

## 6. Is it a frontend or backend problem?

This is one of the most useful questions to ask.

### Frontend problem

The server responds quickly, but the browser has too much work to do.

Typical causes include:

- too much JavaScript,
- oversized images,
- excessive CSS,
- a very large DOM,
- animations,
- third-party scripts.

### Backend problem

The browser is waiting for the server.

Typical causes include:

- slow database queries,
- slow APIs,
- inefficient backend logic,
- excessive server-side processing,
- slow external APIs.

These problems need very different solutions.

So instead of saying:

> "The website is slow. Make it faster."

First ask:

**Where is the system actually spending its time?**

---

## 7. There is not enough caching

Caching is a simple idea:

**If something does not need to be calculated or downloaded again, do not make the user do it again.**

For example, if a visitor repeatedly requests the same CSS file, the browser does not necessarily need to download it from scratch every time.

The same principle can be applied on the server.

If a page changes rarely, parts of it may be served from a cache instead of being generated from scratch for every request.

web.dev includes caching and resource-loading optimisation as important parts of improving web performance. ([web.dev – Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading))

### What should you consider?

Depending on the website, useful layers may include:

- browser caching,
- server-side caching,
- CDN caching,
- caching static files,
- carefully selected API response caching.

Not everything should be cached.

A personalised customer dashboard needs a different approach from a public blog article.

---

## 8. You are not using a CDN where one would help

A Content Delivery Network, or CDN, is a distributed network of servers designed to deliver content closer to users.

Instead of every request travelling back to one origin server, cached resources can be delivered from a location closer to the visitor.

web.dev explains that CDNs can improve performance by reducing network distance and serving cached content without every request travelling back to the origin server. ([web.dev – Content delivery networks](https://web.dev/articles/content-delivery-networks))

A CDN can be particularly useful for:

- images,
- CSS,
- JavaScript,
- video,
- other static assets,
- websites with international traffic.

But a small Budapest business with a relatively modest audience may not need this to be the first optimisation.

**A CDN is not a magic performance switch. It is useful when it addresses an actual delivery problem.**

---

## 9. What are Core Web Vitals?

Core Web Vitals are three metrics designed to measure important parts of the user experience.

### LCP – Largest Contentful Paint

In simple terms:

**How quickly does the main visible content appear?**

This might be a large image, heading or other prominent content.

web.dev describes LCP as an important measure of perceived loading performance. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

### INP – Interaction to Next Paint

INP looks at how quickly the page responds to user interactions.

For example:

```text
Click → processing → visual response
```text

If you click a menu and the browser takes a noticeable amount of time before responding, the interaction experience is poor.

### CLS – Cumulative Layout Shift

CLS measures visual stability.

You may have experienced this:

You are about to click a button, an image or advert finishes loading, and suddenly the entire page moves.

That is the kind of problem CLS is designed to capture.

The current Core Web Vitals set consists of LCP, INP and CLS. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

**Behind the three technical names are three simple questions: does it appear quickly, does it respond quickly, and does it stay where it should?**

---

## How do you measure website speed?

The easiest place to start is Google's PageSpeed Insights.

https://pagespeed.web.dev/

Enter your website URL and check both mobile and desktop results.

PageSpeed Insights provides lab data and, where available, real-user data. Its real-user data comes from the Chrome User Experience Report, or CrUX. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

This distinction matters.

### Lab data

The test runs in a controlled environment.

It is particularly useful while diagnosing and fixing problems during development.

### Real-user data

This reflects what actual visitors experienced when sufficient data is available.

It can therefore reveal bottlenecks that a single controlled test does not.

**Do not focus only on the 0–100 score.**

Look at the diagnostics and recommendations because they help explain what is actually causing the problem.

---

## What should you fix first?

This is one of the most important questions.

You do not necessarily need to implement every PageSpeed recommendation.

A practical order is:

### 1. Large images

If the homepage downloads several megabytes of images, start there.

### 2. Unnecessary JavaScript

Identify scripts that are not needed or do not need to load immediately.

### 3. Slow server response

If the first response is slow, investigate hosting, application code and database performance.

### 4. Caching

Cache static resources and suitable dynamic content where it is safe and useful.

### 5. Third-party scripts

Review analytics, chat, advertising, social widgets and other external code.

### 6. CDN

If users are geographically far from your origin server or you serve a lot of static content, consider a CDN.

### 7. Deeper backend optimisation

If SQL queries, APIs or business logic are responsible, you need developer-level optimisation.

**Fix the thing that is costing the most time or data first.**

---

## Do not optimise for the PageSpeed score

A score of 100 looks nice.

But it is not the business objective.

A website does not automatically generate more customers because it scores 100 in PageSpeed Insights.

The real objective is for the website to:

- show important content quickly,
- work well on mobile,
- respond quickly,
- remain visually stable,
- avoid downloading unnecessary data,
- avoid making users wait for inefficient server processing.

Google's PageSpeed Insights documentation also notes that optimisation recommendations should be considered in the context of their implementation cost and potential benefit for a particular website. ([Google – PageSpeed Insights FAQ](https://developers.google.com/speed/docs/insights/faq))

**A fast website is not a test result. It is a better user experience.**

---

## When do you need a developer?

If the problem is one oversized image, you may be able to fix it yourself.

If you are dealing with:

- slow APIs,
- database queries,
- server-side processing,
- excessive JavaScript,
- complex caching,
- CDN configuration,
- rendering problems,

then it is worth looking at the system from a development perspective.

Performance optimisation is usually a process rather than a single setting.

```text
Measure → identify the problem → change something → measure again
```text

**Good performance work starts with evidence, not guesswork.**

---

## Is your website slow? Do not start with the most expensive solution

A slow website does not automatically need a new server, a new framework or a complete rebuild.

It might be one oversized image.

It might be five unnecessary plugins.

It might be a poorly written SQL query.

Or it might simply be a lack of appropriate caching.

The most useful first step is usually measurement followed by a short technical audit.

Run the site through PageSpeed Insights, identify the biggest bottleneck and **fix the problem that is actually affecting the user's experience first.**

**softwaredevelopment.hu — Performance optimisation, web development and technical solutions for Hungarian businesses.**

---

## Sources

- Google for Developers: [About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about)
- Google for Developers: [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/rest)
- Google: [PageSpeed Insights](https://pagespeed.web.dev/)
- web.dev: [Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path)
- web.dev: [Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading)
- web.dev: [Image performance](https://web.dev/learn/performance/image-performance)
- web.dev: [Key performance issues](https://web.dev/learn/images/performance-issues)
- web.dev: [Third-party JavaScript performance](https://web.dev/articles/third-party-javascript)
- web.dev: [Content delivery networks](https://web.dev/articles/content-delivery-networks)
- web.dev: [Getting started with measuring Web Vitals](https://web.dev/articles/vitals-measurement-getting-started)
- Google for Developers: [PageSpeed Insights FAQ](https://developers.google.com/speed/docs/insights/faq)
````
