# TDD Webapp Generation Workflow — Complete Flow Diagrams

> Generated 2026-03-30. Render with any Mermaid-compatible viewer (GitHub, VS Code preview, mermaid.live).

---

## 1. Master Overview

High-level phase sequence with entry points, clearing boundaries, and iteration loops.

```mermaid
flowchart TD
    %% Entry Points
    SETUP["/setup<br/>Install deps, git prefs"]
    START["/start<br/>Initialize workflow"]
    CONTINUE["/continue<br/>Resume from any phase"]

    %% Phase Sequence
    INTAKE["INTAKE<br/>Requirements gathering"]
    DESIGN["DESIGN<br/>Parallel artifact generation"]
    SCOPE["SCOPE<br/>Define all epics"]
    STORIES["STORIES<br/>Define stories for current epic"]
    REALIGN["REALIGN<br/>Check discovered impacts"]
    TESTDESIGN["TEST-DESIGN<br/>Spec-by-example scenarios"]
    WRITETESTS["WRITE-TESTS<br/>Generate failing tests"]
    IMPLEMENT["IMPLEMENT<br/>Make tests pass"]
    QA["QA<br/>Review + Gates + Verify + Compliance"]
    COMPLETE["COMPLETE<br/>Commit + route next"]
    DONE["Feature Complete!"]

    %% Clearing Boundaries
    CB1{{"CLEAR #1"}}
    CB2{{"CLEAR #2"}}
    CB3{{"CLEAR #3"}}
    CB4{{"CLEAR #4"}}

    %% Flow
    SETUP --> START
    START --> INTAKE
    INTAKE --> CB1
    CB1 -->|"/clear + /continue"| CONTINUE
    CONTINUE -->|"state = DESIGN"| DESIGN
    DESIGN --> CB2
    CB2 -->|"/clear + /continue"| CONTINUE
    CONTINUE -->|"state = SCOPE"| SCOPE
    SCOPE --> CB3
    CB3 -->|"/clear + /continue"| CONTINUE
    CONTINUE -->|"state = STORIES"| STORIES

    STORIES --> REALIGN
    REALIGN --> TESTDESIGN
    TESTDESIGN --> WRITETESTS
    WRITETESTS --> IMPLEMENT
    IMPLEMENT --> QA
    QA --> COMPLETE

    COMPLETE -->|"More stories in epic"| REALIGN
    COMPLETE --> CB4
    CB4 -->|"/clear + /continue"| CONTINUE

    CONTINUE -->|"state = STORIES<br/>next epic"| STORIES
    CONTINUE -->|"state = REALIGN"| REALIGN

    COMPLETE -->|"No more epics"| DONE

    %% Styling
    style CB1 fill:#f96,stroke:#333,color:#000
    style CB2 fill:#f96,stroke:#333,color:#000
    style CB3 fill:#f96,stroke:#333,color:#000
    style CB4 fill:#f96,stroke:#333,color:#000
    style DONE fill:#6f6,stroke:#333,color:#000
    style SETUP fill:#69f,stroke:#333,color:#fff
    style START fill:#69f,stroke:#333,color:#fff
    style CONTINUE fill:#69f,stroke:#333,color:#fff
```

---

## 2. /setup and /start Initialization

```mermaid
flowchart TD
    subgraph SETUP_FLOW["/setup Command"]
        S1{"web/node_modules<br/>exists?"}
        S2["npm install in web/"]
        S3{".claude/preferences.json<br/>exists?"}
        S4["AskUserQuestion:<br/>Git auto-approve prefs"]
        S5["init-preferences.js"]
        S6["Verify: tsc + lint + build"]
        S7["Setup Complete"]

        S1 -->|No| S2
        S1 -->|Yes| S3
        S2 --> S3
        S3 -->|No| S4
        S3 -->|Yes| S6
        S4 --> S5
        S5 --> S6
        S6 --> S7
    end

    subgraph START_FLOW["/start Command"]
        T0{"Setup done?"}
        T1["transition-phase.js --init INTAKE"]
        T2["generate-dashboard-html.js --collect<br/>+ open browser"]
        T3["generate-todo-list.js<br/>+ TodoWrite display"]
        T4["AskUserQuestion:<br/>Onboarding path"]

        T0 -->|No| SETUP_FLOW
        T0 -->|Yes| T1
        SETUP_FLOW --> T1
        T1 --> T2
        T2 --> T3
        T3 --> T4
    end

    subgraph ONBOARDING["Onboarding Routing"]
        OA["Option A:<br/>Share existing docs"]
        OB["Option B:<br/>Import prototype repo"]
        OC["Option C:<br/>Guided Q&A"]
        OA1["User copies files<br/>to documentation/"]
        OB1["import-prototype.js<br/>--from path"]
        OC1["AskUserQuestion:<br/>Project description"]
        PROCEED["Proceed to INTAKE"]

        T4 --> OA
        T4 --> OB
        T4 --> OC
        OA --> OA1 --> PROCEED
        OB --> OB1 --> PROCEED
        OC --> OC1 --> PROCEED
    end

    style SETUP_FLOW fill:#e8f0fe,stroke:#333
    style START_FLOW fill:#e8f4e8,stroke:#333
    style ONBOARDING fill:#fef3e8,stroke:#333
```

---

## 3. /continue Dispatcher Pattern

The parent orchestrator is limited to 2-3 tool calls to avoid a Claude Code hook-dispatch bug.

```mermaid
flowchart TD
    ENTRY["/continue invoked"]
    COLLECT["Bash: collect-dashboard-data.js --format=json"]
    CHECK{"status?"}
    REPAIR["Bash: transition-phase.js --repair"]
    CONF{"confidence?"}

    COORD["Launch coordinator<br/>general-purpose Agent"]
    NEEDS{"Response contains<br/>NEEDS_APPROVAL?"}
    DISPLAY["Display content<br/>to user"]
    ASK["AskUserQuestion<br/>for approval"]
    FRESH["Fresh turn<br/>+ fresh hooks"]
    NEW_COORD["Launch NEW coordinator<br/>with user decision"]
    SHOW["Display summary<br/>to user"]
    BOUNDARY{"Clearing<br/>boundary?"}
    STOP["Instruct: /clear + /continue<br/>STOP"]
    NEXT["Coordinator handled<br/>next phase internally"]

    ENTRY --> COLLECT
    COLLECT --> CHECK
    CHECK -->|"ok"| COORD
    CHECK -->|"no_state"| REPAIR
    REPAIR --> CONF
    CONF -->|"high"| COORD
    CONF -->|"medium"| ASK_CONFIRM["Show detected state<br/>+ ask user to confirm"]
    CONF -->|"low"| REQUIRE["REQUIRE user<br/>verification"]
    ASK_CONFIRM --> COORD
    REQUIRE --> COORD

    COORD --> NEEDS
    NEEDS -->|Yes| DISPLAY
    DISPLAY --> ASK
    ASK --> FRESH
    FRESH --> NEW_COORD

    NEEDS -->|No| SHOW
    SHOW --> BOUNDARY
    BOUNDARY -->|Yes| STOP
    BOUNDARY -->|No| NEXT

    style ENTRY fill:#69f,stroke:#333,color:#fff
    style FRESH fill:#ff9,stroke:#333,color:#000
    style STOP fill:#f96,stroke:#333,color:#000
```

---

## 4. INTAKE Phase

Three sequential agents with optional prototype review for v2 imports.

```mermaid
flowchart TD
    subgraph INTAKE_PHASE["INTAKE Phase"]
        direction TB

        subgraph AGENT1["intake-agent"]
            IA_A["Call A: Scan documentation/<br/>Detect mode (1=specs, 2=partial, 3=scratch)"]
            IA_ORCH["Orchestrator: Display scan summary<br/>Ask 5-6 mandatory questions"]
            IA_Q1["Q1: Roles & Permissions"]
            IA_Q2["Q2: Styling & Branding"]
            IA_Q3["Q3: API & Backend<br/>(dataSource + specCompleteness)"]
            IA_Q4["Q4: Authentication Method<br/>POLICY: authentication-intake.md"]
            IA_Q5["Q5: Compliance & Regulatory<br/>POLICY: compliance-intake.md"]
            IA_Q6{"has_wireframes?"}
            IA_Q6Y["Q6: Wireframe quality"]
            IA_B["Call B: Produce intake-manifest.json<br/>with scan results + user answers"]
            IA_SHOW["Display manifest summary"]
            IA_APPROVE{"User approves<br/>manifest?"}
            IA_C["Call C: Revise manifest"]

            IA_A --> IA_ORCH
            IA_ORCH --> IA_Q1 --> IA_Q2 --> IA_Q3 --> IA_Q4 --> IA_Q5 --> IA_Q6
            IA_Q6 -->|Yes| IA_Q6Y --> IA_B
            IA_Q6 -->|No| IA_B
            IA_B --> IA_SHOW --> IA_APPROVE
            IA_APPROVE -->|"Looks good"| PROTO_CHECK
            IA_APPROVE -->|"I'd change things"| IA_C
            IA_C --> IA_SHOW
        end

        PROTO_CHECK{"v2 prototype<br/>format?"}

        subgraph PROTO["prototype-review-agent (v2 only)"]
            PR_A["Export .pen screenshots<br/>Extract enrichments from genesis.md<br/>Flag assumptions<br/>Cross-validate API specs<br/>Pre-map genesis sections to FRS"]
        end

        subgraph AGENT2["intake-brd-review-agent"]
            BRD_A["Call A: Gap analysis<br/>Review manifest + docs vs 9 FRS sections"]
            BRD_ORCH["Orchestrator: Display gaps<br/>Ask clarifying questions per section"]
            BRD_B["Call B: Produce<br/>feature-requirements.md (FRS)"]
            BRD_SHOW["Display FRS summary:<br/>requirement count, business rules, sections"]
            BRD_APPROVE{"User approves<br/>FRS?"}
            BRD_C["Call C: Finalize<br/>Commit + push + transition to DESIGN"]

            BRD_A --> BRD_ORCH --> BRD_B --> BRD_SHOW --> BRD_APPROVE
            BRD_APPROVE -->|"Looks good"| BRD_C
            BRD_APPROVE -->|"I'd change things"| BRD_A
        end

        PROTO_CHECK -->|Yes| PROTO --> AGENT2
        PROTO_CHECK -->|No| AGENT2

        BRD_C --> CB1_INT{{"CLEARING BOUNDARY #1<br/>/clear + /continue"}}
    end

    style CB1_INT fill:#f96,stroke:#333,color:#000
    style PROTO fill:#fef,stroke:#333
```

---

## 5. DESIGN Phase

Parallel Call A execution, sequential approvals, then autonomous agents.

```mermaid
flowchart TD
    subgraph DESIGN_PHASE["DESIGN Phase"]
        READ_MANIFEST["Read intake-manifest.json<br/>Determine which artifacts to generate"]

        subgraph COPY["Copy User-Provided Files"]
            COPY_CHECK{"generate == false<br/>+ userProvided?"}
            COPY_RUN["copy-with-header.js<br/>--from source --to generated-docs/specs/"]
        end

        subgraph PARALLEL_A["Parallel Call A (all at once)"]
            direction LR
            API_A["design-api-agent<br/>Call A: Draft API spec"]
            STYLE_A["design-style-agent<br/>Call A: Draft design tokens"]
            WIRE_A["design-wireframe-agent<br/>Call A: Draft wireframes"]
        end

        WIRE_SKIP{"wireframes.generate<br/>=== false?<br/>(v2 .pen screenshots)"}

        subgraph APPROVALS["Sequential Approvals (fixed order)"]
            API_APPR["API Spec: Display + AskUserQuestion"]
            STYLE_APPR["Design Tokens: Display + AskUserQuestion"]
            WIRE_APPR["Wireframes: Display + AskUserQuestion"]
        end

        subgraph PARALLEL_B["Parallel Call B"]
            direction LR
            API_B["design-api-agent<br/>Call B: Write spec"]
            STYLE_B["design-style-agent<br/>Call B: Write tokens"]
        end

        subgraph AUTO["Autonomous Agents + Wireframe Call B (parallel)"]
            direction LR
            MOCK["mock-setup-agent<br/>Generate MSW handlers"]
            TYPES["type-generator-agent<br/>Generate TS types"]
            WIRE_B["design-wireframe-agent<br/>Call B: Write wireframes"]
        end

        WIRE_APPR2["Wireframe approval<br/>+ Call C"]

        FINALIZE["Commit + transition-phase.js --to SCOPE --verify-output"]
        CB2_INT{{"CLEARING BOUNDARY #2<br/>/clear + /continue"}}

        READ_MANIFEST --> COPY
        COPY_CHECK -->|Yes| COPY_RUN
        COPY_CHECK -->|No| PARALLEL_A
        COPY_RUN --> PARALLEL_A

        READ_MANIFEST --> WIRE_SKIP
        WIRE_SKIP -->|Yes, skip wireframe agent| PARALLEL_A
        WIRE_SKIP -->|No, include it| PARALLEL_A

        PARALLEL_A --> APPROVALS
        APPROVALS --> PARALLEL_B
        PARALLEL_B --> AUTO
        AUTO --> WIRE_APPR2
        WIRE_APPR2 --> FINALIZE
        FINALIZE --> CB2_INT
    end

    subgraph DESIGN_AGENTS_STATE["Design Agent State Tracking"]
        DAS1["transition-phase.js --design-agent set"]
        DAS2["transition-phase.js --design-agent start"]
        DAS3["transition-phase.js --design-agent complete"]
    end

    style CB2_INT fill:#f96,stroke:#333,color:#000
    style PARALLEL_A fill:#e8f0fe,stroke:#333
    style AUTO fill:#e8f0fe,stroke:#333
```

---

## 6. SCOPE and STORIES

```mermaid
flowchart TD
    subgraph SCOPE_PHASE["SCOPE Phase"]
        SC_A["feature-planner Call A:<br/>Propose epic breakdown<br/>(read FRS, return epic list)"]
        SC_SHOW["Display epic list<br/>with descriptions + dependency map"]
        SC_APPROVE{"User approves<br/>epics?"}
        SC_B["feature-planner Call B:<br/>Write _feature-overview.md<br/>Update CLAUDE.md<br/>Commit + push"]
        SC_REV["feature-planner Call A:<br/>Revise with feedback"]
        CB3_INT{{"CLEARING BOUNDARY #3<br/>/clear + /continue"}}

        SC_A --> SC_SHOW --> SC_APPROVE
        SC_APPROVE -->|"Looks good"| SC_B
        SC_APPROVE -->|"I'd restructure"| SC_REV --> SC_SHOW
        SC_B --> CB3_INT
    end

    subgraph STORIES_PHASE["STORIES Phase (per epic)"]
        ST_A["feature-planner Call A:<br/>Propose stories for Epic N<br/>(read FRS + epic overview)"]
        ST_SHOW["Display story list<br/>with acceptance criteria"]
        ST_APPROVE{"User approves<br/>stories?"}
        ST_B["feature-planner Call B:<br/>Write story files<br/>Update _epic-overview.md<br/>Commit + push"]
        ST_REV["feature-planner Call A:<br/>Revise with feedback"]
        ST_NEXT["Proceed to REALIGN<br/>(no clearing boundary)"]

        ST_A --> ST_SHOW --> ST_APPROVE
        ST_APPROVE -->|"Looks good"| ST_B
        ST_APPROVE -->|"I'd change things"| ST_REV --> ST_SHOW
        ST_B --> ST_NEXT
    end

    CB3_INT -->|"/clear + /continue"| STORIES_PHASE

    style CB3_INT fill:#f96,stroke:#333,color:#000
```

---

## 7. Per-Story TDD Cycle (REALIGN through COMPLETE)

```mermaid
flowchart TD
    subgraph STORY_CYCLE["Per-Story TDD Cycle"]

        subgraph REALIGN_PHASE["REALIGN"]
            RL_A["feature-planner Call A:<br/>Read discovered-impacts.md"]
            RL_CHECK{"Impacts exist<br/>for this story?"}
            RL_AUTO["No impacts:<br/>Auto-transition to TEST-DESIGN"]
            RL_SHOW["Display proposed revisions"]
            RL_APPROVE{"User approves<br/>revisions?"}
            RL_B["feature-planner Call B:<br/>Apply revisions to story<br/>Clear processed impacts"]

            RL_A --> RL_CHECK
            RL_CHECK -->|No| RL_AUTO
            RL_CHECK -->|Yes| RL_SHOW --> RL_APPROVE
            RL_APPROVE -->|Yes| RL_B
            RL_APPROVE -->|"I'd change it"| RL_A
        end

        subgraph TD_PHASE["TEST-DESIGN"]
            TD_A["test-designer Call A:<br/>Produce spec-by-example document<br/>(Setup/Input/Expected tables)"]
            TD_DOC["Write to generated-docs/test-design/"]
            TD_SHOW["Display FULL document<br/>for BA review"]
            TD_APPROVE{"User approves<br/>test design?"}
            TD_REV["test-designer revises"]

            TD_A --> TD_DOC --> TD_SHOW --> TD_APPROVE
            TD_APPROVE -->|"Looks good"| WT
            TD_APPROVE -->|"I have changes"| TD_REV --> TD_SHOW
        end

        subgraph WT_PHASE["WRITE-TESTS (autonomous)"]
            WT["test-generator:<br/>Generate failing tests<br/>from test-design + story"]
            WT_OUT["Tests written to<br/>web/src/__tests__/integration/"]
        end

        subgraph IMPL_PHASE["IMPLEMENT (autonomous)"]
            IMPL_TESTS["Run npm test<br/>Capture failing tests"]
            IMPL_A["developer Call A:<br/>Write code to make<br/>all tests pass"]
            IMPL_B["developer Call B:<br/>Pre-flight test check<br/>Fix any remaining failures"]
        end

        subgraph QA_PHASE["QA (see detailed diagram below)"]
            QA_ENTER["Code review + Gates<br/>+ Manual verify<br/>+ Spec compliance<br/>+ Commit"]
        end

        COMPLETE_CHECK{"Next action?"}
        NEXT_STORY["Next story in epic:<br/>REALIGN"]
        NEXT_EPIC{{"CLEARING BOUNDARY #4<br/>Next epic: /clear + /continue → STORIES"}}
        FEATURE_DONE["Feature Complete!"]

        RL_AUTO --> TD_PHASE
        RL_B --> TD_PHASE
        WT --> WT_OUT --> IMPL_TESTS
        IMPL_TESTS --> IMPL_A --> IMPL_B
        IMPL_B --> QA_PHASE
        QA_ENTER --> COMPLETE_CHECK
        COMPLETE_CHECK -->|"More stories"| NEXT_STORY
        COMPLETE_CHECK -->|"Last story,<br/>more epics"| NEXT_EPIC
        COMPLETE_CHECK -->|"No more epics"| FEATURE_DONE
        NEXT_STORY --> REALIGN_PHASE
    end

    style NEXT_EPIC fill:#f96,stroke:#333,color:#000
    style FEATURE_DONE fill:#6f6,stroke:#333,color:#000
    style WT_PHASE fill:#e8f0fe,stroke:#333
    style IMPL_PHASE fill:#e8f0fe,stroke:#333
```

---

## 8. QA Phase — Detailed

Three scoped calls + manual verification + fix cycle + spec compliance.

```mermaid
flowchart TD
    subgraph QA_DETAIL["QA Phase Detail"]
        direction TB

        subgraph REVIEW["Code Review + Quality Gates"]
            CR_A["code-reviewer Call A:<br/>Code review only"]
            CR_B["code-reviewer Call B:<br/>Run 5 quality gates<br/>+ /simplify on changed code<br/>+ Return manual verification checklist"]
        end

        ROUTE_CHECK{"Component<br/>routable?"}

        subgraph NON_ROUTE["Non-Routable Path"]
            NR_NOTE["Display component-only note<br/>Auto-skip manual verification"]
        end

        subgraph MANUAL["Manual Verification (routable only)"]
            MV_SHOW["Display:<br/>1. Quality gate results<br/>2. Manual verification checklist"]
            MV_ASK{"User verifies<br/>in browser?"}
            MV_PASS["All tests pass"]
            MV_ISSUES["Issues found"]
            MV_SKIP["Skip for now"]
        end

        subgraph FIX_CYCLE["QA Fix Cycle (if issues found)"]
            FIX_ASK["AskUserQuestion:<br/>Describe the issues"]
            FIX_FRESH["Fresh turn + fresh hooks"]
            FIX_COORD["Launch fix-cycle coordinator"]
            FIX_DEV["developer: Fix issues"]
            FIX_CR_A["code-reviewer Call A: Review fixes"]
            FIX_CR_B["code-reviewer Call B: Re-run gates"]
            FIX_SHOW["Display fix summary<br/>NEEDS_APPROVAL"]
            FIX_REVERIFY{"User re-verifies?"}

            FIX_ASK --> FIX_FRESH --> FIX_COORD
            FIX_COORD --> FIX_DEV --> FIX_CR_A --> FIX_CR_B --> FIX_SHOW
            FIX_SHOW --> FIX_REVERIFY
            FIX_REVERIFY -->|"Issues found again"| FIX_ASK
            FIX_REVERIFY -->|"All tests pass / Skip"| SPEC_COMP
        end

        subgraph SPEC["Spec Compliance Check (Gate 6)"]
            SPEC_COMP["spec-compliance-watchdog Call A:<br/>Compare every AC + test scenario<br/>against implementation"]
            SPEC_CHECK{"Compliance<br/>result?"}
            SPEC_PASS["PASS: Display confirmation"]
            SPEC_FAIL["FAIL: Display report"]
            SPEC_ASK{"User choice?"}
            SPEC_FIX_CODE["Option A: Fix code to match specs"]
            SPEC_FIX_SPEC["Option B: Update specs to match code"]

            SPEC_FIX_DEV["Launch fix coordinator:<br/>developer fixes inconsistencies"]
            SPEC_RECHECK["Re-run watchdog Call A"]
            SPEC_STILL{"Still fails?"}

            SPEC_UPDATE["watchdog Call B:<br/>Update story + test-design + handoff<br/>to match implementation"]

            SPEC_COMP --> SPEC_CHECK
            SPEC_CHECK -->|PASS| SPEC_PASS
            SPEC_CHECK -->|FAIL| SPEC_FAIL --> SPEC_ASK
            SPEC_ASK --> SPEC_FIX_CODE
            SPEC_ASK --> SPEC_FIX_SPEC
            SPEC_FIX_CODE --> SPEC_FIX_DEV --> SPEC_RECHECK --> SPEC_STILL
            SPEC_STILL -->|Yes| SPEC_FAIL
            SPEC_STILL -->|No| SPEC_PASS
            SPEC_FIX_SPEC --> SPEC_UPDATE --> SPEC_PASS
        end

        subgraph COMMIT["Call C: Commit"]
            PRE_CHECK["transition-phase.js<br/>--pre-complete-checks --current --story M"]
            GATES_RERUN{"Fix cycle or<br/>spec code fix<br/>occurred?"}
            RERUN_GATES["Re-run ALL quality gates"]
            SKIP_GATES["Quality gates already passed"]
            DO_COMMIT["git commit + push"]
            TRANSITION["transition-phase.js<br/>--phase COMPLETE --epic N --story M"]
            DASHBOARD["generate-dashboard-html.js --collect"]
            CB4{{"CLEARING BOUNDARY #4<br/>/clear + /continue"}}

            PRE_CHECK --> GATES_RERUN
            GATES_RERUN -->|Yes| RERUN_GATES --> DO_COMMIT
            GATES_RERUN -->|No| SKIP_GATES --> DO_COMMIT
            DO_COMMIT --> TRANSITION --> DASHBOARD --> CB4
        end

        CR_A --> CR_B
        CR_B --> ROUTE_CHECK
        ROUTE_CHECK -->|"Non-routable"| NR_NOTE
        NR_NOTE -->|"status: auto-skipped"| SPEC_COMP
        ROUTE_CHECK -->|"Routable"| MV_SHOW
        MV_SHOW --> MV_ASK
        MV_ASK --> MV_PASS
        MV_ASK --> MV_ISSUES
        MV_ASK --> MV_SKIP
        MV_ISSUES --> FIX_CYCLE
        MV_PASS --> SPEC_COMP
        MV_SKIP --> SPEC_COMP
        SPEC_PASS --> COMMIT
    end

    style CB4 fill:#f96,stroke:#333,color:#000
    style FIX_CYCLE fill:#fff0f0,stroke:#c33
    style SPEC fill:#f0f0ff,stroke:#33c
```

---

## 9. Quality Gates (6 Gates)

```mermaid
flowchart LR
    subgraph GATES["6 Quality Gates"]
        direction TB
        G1["Gate 1: Functional<br/>Manual user verification<br/>(Agent: user)"]
        G2["Gate 2: Security<br/>npm audit + secret scan<br/>(Script: quality-gates.js)"]
        G3["Gate 3: Code Quality<br/>Prettier + tsc + ESLint + Build<br/>(Script: quality-gates.js)"]
        G4["Gate 4: Testing<br/>npm test + coverage<br/>(Script: quality-gates.js)"]
        G5["Gate 5: Performance<br/>Lighthouse (optional locally)<br/>(Script: quality-gates.js)"]
        G6["Gate 6: Spec Compliance<br/>AC + test-design vs code<br/>(Agent: spec-compliance-watchdog)"]
    end

    POLICY["POLICY: quality-gates.md<br/>Binary pass/fail ONLY<br/>No exceptions or caveats"]

    G1 --- POLICY
    G2 --- POLICY
    G3 --- POLICY
    G4 --- POLICY
    G5 --- POLICY
    G6 --- POLICY

    style POLICY fill:#fee,stroke:#c33,color:#000
```

---

## 10. Hooks & Infrastructure

```mermaid
flowchart TD
    subgraph HOOKS["Hook System (settings.json)"]
        direction TB

        subgraph LIFECYCLE["Lifecycle Hooks"]
            H_SS["SessionStart<br/>capture-context.ps1<br/>+ inject-phase-context.ps1"]
            H_SE["SessionEnd<br/>capture-context.ps1"]
            H_PS["UserPromptSubmit<br/>capture-context.ps1"]
            H_PC["PreCompact<br/>capture-context.ps1"]
            H_ST["Stop<br/>capture-context.ps1"]
            H_NF["Notification<br/>capture-context.ps1"]
        end

        subgraph AGENT_HOOKS["Agent Hooks"]
            H_SAS["SubagentStart<br/>capture-context.ps1<br/>+ inject-agent-context.ps1*"]
            H_SAE["SubagentStop<br/>capture-context.ps1"]
            AGENTS_LIST["*inject-agent-context for:<br/>developer, test-generator,<br/>code-reviewer, feature-planner,<br/>design-api/style/wireframe-agent,<br/>intake-agent, intake-brd-review-agent"]
        end

        subgraph TOOL_HOOKS["Tool Hooks"]
            H_BASH["PreToolUse (Bash)<br/>bash-permission-checker.js<br/>Auto-approve safe commands"]
            H_PRE["PreToolUse (all)<br/>capture-context.ps1"]
            H_POST["PostToolUse (all)<br/>capture-context.ps1"]
            H_WRITE["PostToolUse (Write/Edit)<br/>generate-progress-index.js"]
            H_PERM["PermissionRequest<br/>capture-context.ps1"]
        end
    end

    subgraph BASH_CHECKER["bash-permission-checker.js"]
        BC_DENY["DENY: rm -rf /, SSH keys,<br/>credentials, force-push,<br/>--no-verify"]
        BC_ALLOW["ALLOW: npm/npx, node scripts<br/>in safe dirs, git ops<br/>(per preferences.json),<br/>curl localhost only"]
        BC_DIRS["Safe dirs: documentation/,<br/>web/, generated-docs/,<br/>.claude/, .github/"]
    end

    subgraph SCRIPTS["Key Scripts (.claude/scripts/)"]
        direction TB
        SC_TP["transition-phase.js<br/>--init, --to, --complete,<br/>--repair, --show,<br/>--design-agent, --verify-output,<br/>--pre-complete-checks"]
        SC_CD["collect-dashboard-data.js<br/>--format=json|text"]
        SC_DH["generate-dashboard-html.js<br/>--collect"]
        SC_TL["generate-todo-list.js"]
        SC_QG["quality-gates.js<br/>--auto-fix, --json,<br/>--fail-fast, --sequential"]
        SC_VP["validate-phase-output.js<br/>--phase, --epic, --story"]
        SC_CW["copy-with-header.js<br/>--from, --to"]
        SC_IP["import-prototype.js<br/>--from"]
        SC_PR["init-preferences.js<br/>--autoApproveCommit,<br/>--autoApprovePush"]
    end

    subgraph POLICIES["Policies (.claude/policies/)"]
        P_AUTH["authentication-intake.md<br/>Never skip/simplify auth questions<br/>BFF vs frontend-only vs custom"]
        P_COMP["compliance-intake.md<br/>Keyword triggers for<br/>PCI-DSS, GDPR, HIPAA, etc."]
        P_QG["quality-gates.md<br/>Binary pass/fail<br/>6 gates defined"]
    end

    H_BASH --> BASH_CHECKER

    style HOOKS fill:#f0f0ff,stroke:#333
    style BASH_CHECKER fill:#fff0f0,stroke:#333
    style SCRIPTS fill:#f0fff0,stroke:#333
    style POLICIES fill:#fff8e8,stroke:#333
```

---

## 11. State Management & Artifacts

```mermaid
flowchart TD
    subgraph STATE["State Management"]
        WS["workflow-state.json<br/>(generated-docs/context/)"]
        TP["transition-phase.js<br/>Reads/writes state"]
        DS["detect-workflow-state.js<br/>Scans artifacts to recover state"]
        WH["lib/workflow-helpers.js<br/>Shared utilities"]
    end

    subgraph ARTIFACTS["Generated Artifacts by Phase"]
        direction TB
        ART_INT["INTAKE:<br/>intake-manifest.json<br/>feature-requirements.md"]
        ART_DES["DESIGN:<br/>api-spec.yaml<br/>design-tokens.css + .md<br/>wireframes/<br/>web/src/mocks/handlers.ts<br/>web/src/types/api-generated.ts"]
        ART_SCP["SCOPE:<br/>_feature-overview.md<br/>epic-N-name/ directories"]
        ART_STR["STORIES:<br/>story-M-name.md<br/>_epic-overview.md"]
        ART_TD["TEST-DESIGN:<br/>story-M-name-test-design.md<br/>story-M-name-test-handoff.md"]
        ART_WT["WRITE-TESTS:<br/>*.test.tsx in<br/>web/src/__tests__/integration/"]
        ART_IMP["IMPLEMENT:<br/>Components, pages,<br/>API functions in web/src/"]
        ART_QA["QA:<br/>quality-gate-status.json<br/>git commit"]
    end

    subgraph TRACEABILITY["AC Traceability Chain"]
        TR1["Story file<br/>AC-1, AC-2, ..."]
        TR2["Test-design doc<br/>AC → Scenario mapping"]
        TR3["Test files<br/>AC-N references in code"]
        TR4["Implementation<br/>Code satisfying ACs"]
        TR5["Spec compliance<br/>Verify AC coverage"]

        TR1 --> TR2 --> TR3 --> TR4 --> TR5
    end

    TP --> WS
    DS --> WS

    style STATE fill:#e8f0fe,stroke:#333
    style TRACEABILITY fill:#f0fff0,stroke:#333
```

---

## 12. Agent Reference

All 14 agents and when they are invoked.

```mermaid
flowchart LR
    subgraph AGENTS["Agent Inventory"]
        direction TB

        subgraph REQ["Requirements (INTAKE)"]
            A1["intake-agent<br/>Calls: A (scan), B (manifest), C (revise)"]
            A2["prototype-review-agent<br/>v2 only: screenshots + enrichments"]
            A3["intake-brd-review-agent<br/>Calls: A (gaps), B (FRS), C (finalize)"]
        end

        subgraph DES["Design (DESIGN)"]
            A4["design-api-agent<br/>Calls: A (draft), B (write spec)"]
            A5["design-style-agent<br/>Calls: A (draft), B (write tokens)"]
            A6["design-wireframe-agent<br/>Calls: A (draft), B (write), C (finalize)"]
            A7["mock-setup-agent<br/>Autonomous: Generate MSW handlers"]
            A8["type-generator-agent<br/>Autonomous: Generate TS types"]
        end

        subgraph PLAN["Planning (SCOPE/STORIES/REALIGN)"]
            A9["feature-planner<br/>SCOPE: A (propose epics), B (write)<br/>STORIES: A (propose stories), B (write)<br/>REALIGN: A (check impacts), B (apply)"]
        end

        subgraph TDD["TDD (TEST-DESIGN/WRITE-TESTS/IMPLEMENT)"]
            A10["test-designer<br/>Call A: Design spec-by-example scenarios"]
            A11["test-generator<br/>Single call: Generate failing tests"]
            A12["developer<br/>IMPLEMENT: A (code), B (pre-flight)<br/>QA fix cycle: fix issues"]
        end

        subgraph QUALITY["Quality (QA)"]
            A13["code-reviewer<br/>Calls: A (review), B (gates), C (commit)"]
            A14["spec-compliance-watchdog<br/>Calls: A (analyze), B (update specs)"]
        end
    end

    style REQ fill:#fef3e8,stroke:#333
    style DES fill:#e8f0fe,stroke:#333
    style PLAN fill:#e8f4e8,stroke:#333
    style TDD fill:#fff0f0,stroke:#333
    style QUALITY fill:#f0f0ff,stroke:#333
```

---

## 13. Complete Linear Flow (Condensed)

One-line-per-step walkthrough of the entire process.

```
/setup          → Install deps → Git prefs → Verify build
                    |
/start          → Init state → Dashboard → Onboarding routing
                    |
INTAKE          → intake-agent (scan → questions → manifest)
                → [v2? prototype-review-agent]
                → intake-brd-review-agent (gaps → FRS)
                → COMMIT → CLEAR #1
                    |
/continue       → collect state → launch coordinator
                    |
DESIGN          → [copy user files]
                → Parallel: api-agent + style-agent + [wireframe-agent]
                → Sequential approvals
                → Parallel: Call B + autonomous agents
                → COMMIT → CLEAR #2
                    |
SCOPE           → feature-planner (propose → approve → write epics)
                → COMMIT → CLEAR #3
                    |
STORIES         → feature-planner (propose → approve → write stories)
                → (no clearing boundary — proceed to first story)
                    |
  +--------------+-----------------------------------------------------+
  |              FOR EACH STORY IN EPIC                                 |
  |                                                                     |
  |  REALIGN     → Check discovered-impacts.md                          |
  |              → [impacts? propose revisions → approve → apply]       |
  |              → [no impacts? auto-proceed]                           |
  |                  |                                                  |
  |  TEST-DESIGN → test-designer (scenarios → BA review → approve)     |
  |                  |                                                  |
  |  WRITE-TESTS → test-generator (failing tests) [autonomous]         |
  |                  |                                                  |
  |  IMPLEMENT   → npm test (capture failures)                         |
  |              → developer Call A (make tests pass)                   |
  |              → developer Call B (verify all pass) [autonomous]      |
  |                  |                                                  |
  |  QA          → code-reviewer Call A (review)                        |
  |              → code-reviewer Call B (5 quality gates + checklist)    |
  |              → Manual verification (user checks browser)            |
  |              → [issues? fix cycle → re-verify]                      |
  |              → spec-compliance-watchdog (Gate 6)                    |
  |              → [fail? fix code or update specs]                     |
  |              → code-reviewer Call C (commit)                        |
  |              → CLEAR #4                                             |
  |                                                                     |
  |  COMPLETE    → More stories? → loop back to REALIGN                 |
  |              → Last story? → CLEAR #4 for next epic                 |
  +--------------+-----------------------------------------------------+
                    |
  FOR EACH EPIC  → /continue → STORIES for next epic → story loop
                    |
  ALL DONE       → Feature Complete!
```
