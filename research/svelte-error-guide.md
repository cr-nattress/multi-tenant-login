Svelte Application Error Resolution Guide for AI Agent

Overview

This document provides structured guidelines and patterns enabling AI agents to efficiently identify, diagnose, and resolve errors encountered in Svelte applications.

1. Error Detection Patterns

Log Analysis

Identify error messages within browser console logs and server logs.

Parse error type, message content, and stack traces.

Component Boundary Detection

Identify errors originating from Svelte components by stack trace patterns (*.svelte files).

Prioritize component-level debugging before global debugging.

2. Error Classification

Classify errors into one of the following types:

Compile-Time Errors

Typically syntax or configuration related.

Runtime Errors

Occur during app execution (e.g., null/undefined variables, API call failures).

Reactivity Errors

Involve incorrect reactive declarations ($: syntax).

State Management Errors

Issues related to incorrect state handling or unexpected state mutations.

3. Diagnostic Steps

Perform these steps sequentially:

Examine Error Message:

Extract meaningful content indicating root cause.

Analyze Stack Trace:

Determine exact file/component and line number causing the error.

Check Component State:

Inspect component state and props at error time.

Inspect Recent Changes:

Review recent git commits or deployments for regression errors.

4. Resolution Strategies

Apply resolutions based on error classification:

Compile-Time Errors

Validate Svelte syntax and component imports.

Ensure compatibility between packages.

Rebuild application to verify resolution.

Runtime Errors

Implement null/undefined checks.

Handle API errors gracefully.

Implement fallback/error boundary components.

Reactivity Errors

Correct reactive declarations, ensuring dependencies are explicitly stated.

Avoid cyclic or infinite reactive statements.

State Management Errors

Validate state transitions and mutations.

Confirm immutability principles are correctly applied.

Refactor complex state logic into smaller, manageable stores or derived states.

5. Post-Resolution Validation

Re-run test suites and automated component tests.

Validate fixes via staging deployment.

Log successful resolutions to knowledge base for future reference.

6. Continuous Learning

Track recurring errors to identify patterns.

Suggest improvements or refactoring proactively.

Integrate resolved cases into training dataset to improve future diagnostics.

