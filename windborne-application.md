# WindBorne Systems - Software Engineer, Machine Learning Systems

Application challenge responses - draft for review before submission.

## 1. Tell us about a problem you couldn’t leave alone. What did you build to fix it?

I kept running into the same problem when working with AI agents: getting a good answer once was easy, but getting a reliable process around it was much harder.

I built PRD Council to explore that problem. It brings three models together to independently review a software product idea from different perspectives: architecture, product requirements, and risks. Instead of accepting the first response, the system makes each reviewer identify specific issues, sends them back for revision, and tracks what was changed or left unresolved.

I built the orchestration in Python, with limits on review rounds, separate model sessions, failure handling, and a log of the decisions made.

What interested me most was not making models debate. It was figuring out how to make their output inspectable and how to prevent the workflow from quietly accepting something incomplete.

## 2. Tell us about a time you had to understand an unfamiliar system that wasn’t behaving as expected. How did you get to the bottom of it?

I worked on a project predicting phosphorus levels at the end of a steelmaking process. The goal was to make accurate predictions using sensor and process data, but repeated experiments were not reaching the accuracy the plant wanted.

Rather than keep trying different models, I started investigating the data itself. I compared the target values against the laboratory measurements, checked inconsistencies between records, and looked at which measurements were actually available before the prediction needed to happen.

The key problem was that the available sensors measured things related to phosphorus, but not phosphorus itself during the process. Some potentially important information was missing.

That changed how I approached the problem. I focused on validating the data and understanding the physical limitations before proposing more model changes. The main lesson was that when a system performs poorly, the issue isn't always in the code or algorithm. Sometimes the inputs don't contain enough information to deliver the expected result.

## 3. Describe a real coding task where AI tools helped you move faster. Where did you have to step in and think for yourself?

While building my insurance model evaluation app, I used AI coding tools to move faster through the repetitive work of creating modules, connecting the pipeline, and writing tests.

The application takes an uploaded dataset, cleans it, trains multiple models, evaluates them, and repeats the process using a new plan. AI tools helped me write the initial implementations and work across the different Python modules.

But I still had to decide how the system should behave when something went wrong. For example, the LLM planning step shouldn't become a single point of failure. I built in a rule-based fallback so the pipeline could continue even if the model call failed or an API key wasn't configured.

I also had to keep model comparisons consistent rather than let each iteration choose whichever metric made its results look best. For me, AI tools accelerate implementation, but I still need to decide what correctness means and test the result.

## 4. Describe the extent to which you have experience with production systems.

My professional experience includes two years at Cognizant, mainly working on internal technical projects and data analysis. Since then, I've built backend APIs, RAG applications, agent workflows, and data processing systems through independent and project-based work.

I've handled API integration, input validation, debugging, and connecting multiple components that need to work together. My public portfolio is deployed on GitHub Pages, with automated checks for broken assets, JavaScript syntax, and other basic regressions.

I want to be precise about the distinction between building software and operating a large production service. I have practical development and debugging experience, but I haven't independently owned a large, always-on production system with formal uptime targets and on-call responsibility.

That's an area where I want to grow. I understand that reliable software requires more than a successful local run, including monitoring, predictable failure handling, testing, and recovery.

## 5. How many years of relevant experience do you have?

I have two years of professional experience at Cognizant, along with additional hands-on software engineering experience through independent projects and AI application development during and after my master's degree.
