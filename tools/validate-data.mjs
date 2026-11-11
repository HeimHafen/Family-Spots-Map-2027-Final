#!/usr/bin/env node
// Compatibility entry point for the current dependency-free project checks.
// Validates active spot records, translations and offline assets, together with
// JavaScript/JSON syntax. This does not perform JSON Schema validation: the
// historical tools/schema files describe an older, unused data format.
import "./check-project.mjs";
