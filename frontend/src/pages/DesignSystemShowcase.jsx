import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../components/Toast';

export function DesignSystemShowcase() {
  const toast = useToast();

  // Modal demo state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Input demo states
  const [searchValue, setSearchValue] = useState('');
  const [goalTitle, setGoalTitle] = useState('Master Distributed Cloud Systems');
  const [textareaValue, setTextareaValue] = useState(
    'Break down the architecture into micro-milestones and deploy to Supabase PostgreSQL.'
  );
  const [errorInputVal, setErrorInputVal] = useState('');

  // Button loading states
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  // Progress bar interactive slider
  const [progressVal, setProgressVal] = useState(68);

  const simulateLoading = () => {
    setIsBtnLoading(true);
    setTimeout(() => {
      setIsBtnLoading(false);
      toast.success('Action simulated successfully!', 'Async Process Finished');
    }, 1500);
  };

  return (
    <div className="container-saas" style={{ paddingBottom: '5rem' }}>
      {/* Hero Header Section */}
      <section style={{ marginBottom: '2.5rem', paddingTop: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '0.8125rem',
            fontWeight: '700',
            marginBottom: '0.75rem',
            letterSpacing: '0.01em',
          }}
        >
          <span>✨</span>
          <span>GoalForge Design System &amp; UI Component Library</span>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
            color: 'var(--color-text-primary)',
          }}
        >
          Plan. Progress. <span style={{ color: 'var(--color-primary)' }}>Achieve.</span>
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6,
          }}
        >
          A cohesive, modern SaaS interface built with <strong>Space Grotesk</strong> for bold headings,
          <strong> Plus Jakarta Sans</strong> for clean typography, Light Cool Gray surfaces, and rounded white cards.
        </p>
      </section>

      {/* Grid of Component Showcase Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* ===================================================================
            SECTION 1: Color System & Tokens
            =================================================================== */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Color Palette &amp; Design Tokens</h2>
            <p>Tailored HSL-calibrated palette designed for crisp contrast and visual hierarchy.</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              { name: 'Primary Indigo', hex: '#4f46e5', bg: 'var(--color-primary)', text: '#fff' },
              { name: 'Secondary Cyan', hex: '#06b6d4', bg: 'var(--color-secondary)', text: '#fff' },
              { name: 'Cool Gray Bg', hex: '#f8fafc', bg: 'var(--color-bg)', text: '#0f172a', border: true },
              { name: 'Card Surface', hex: '#ffffff', bg: 'var(--color-surface)', text: '#0f172a', border: true },
              { name: 'Dark Navy Text', hex: '#0f172a', bg: 'var(--color-text-primary)', text: '#fff' },
              { name: 'Success Emerald', hex: '#10b981', bg: 'var(--color-success)', text: '#fff' },
              { name: 'Warning Amber', hex: '#f59e0b', bg: 'var(--color-warning)', text: '#fff' },
              { name: 'Danger Red', hex: '#ef4444', bg: 'var(--color-danger)', text: '#fff' },
            ].map((c) => (
              <div
                key={c.name}
                style={{
                  backgroundColor: c.bg,
                  color: c.text,
                  border: c.border ? '1px solid var(--color-border)' : 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.85, fontFamily: 'monospace' }}>{c.hex}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            SECTION 2: Buttons Component
            =================================================================== */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Reusable Buttons</h2>
            <p>Multiple variants, sizes, icon alignments, loading spinners, and states.</p>
          </div>

          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Variants Row */}
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  Variants
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  <Button variant="primary">Primary Indigo</Button>
                  <Button variant="secondary">Secondary Cyan</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              {/* Sizes Row */}
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  Sizes &amp; Icons
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  <Button size="sm" icon={<span>⚡</span>}>Small Action</Button>
                  <Button size="md" icon={<span>🚀</span>}>Medium Default</Button>
                  <Button size="lg" icon={<span>🎯</span>}>Large CTA</Button>
                  <Button
                    variant="primary"
                    loading={isBtnLoading}
                    onClick={simulateLoading}
                  >
                    {isBtnLoading ? 'Processing...' : 'Click to Load'}
                  </Button>
                  <Button variant="outline" disabled>Disabled State</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ===================================================================
            SECTION 3: Input Controls
            =================================================================== */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Form Inputs &amp; Controls</h2>
            <p>Clean focus ring, helper captions, leading icons, clearable triggers, and error validation.</p>
          </div>

          <Card>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <Input
                label="Goal Title"
                placeholder="e.g. Master Full-Stack Architecture"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                helperText="Enter a specific, measurable objective."
                icon={<span>🎯</span>}
              />

              <Input
                label="Search Keywords"
                placeholder="Search milestones or habits..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue('')}
                clearable
                icon={<span>🔍</span>}
                helperText="Click ✕ on the right to clear input."
              />

              <Input
                label="Validation Error State"
                placeholder="Required field..."
                value={errorInputVal}
                onChange={(e) => setErrorInputVal(e.target.value)}
                error={errorInputVal.length < 3 ? 'Must contain at least 3 characters' : undefined}
                helperText="Type 3 or more characters to resolve."
              />

              <div style={{ gridColumn: '1 / -1' }}>
                <Input
                  isTextarea
                  rows={3}
                  label="Execution Strategy (Textarea)"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  helperText="Describe daily actions and weekly checkpoints."
                />
              </div>
            </div>
          </Card>
        </section>

        {/* ===================================================================
            SECTION 4: Progress Bar Component
            =================================================================== */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Progress Bars</h2>
            <p>Sleek rounded progress indicators with sizes, colors, and live dynamic slider.</p>
          </div>

          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Interactive Controller Slider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: '700', minWidth: '130px' }}>
                  Interactive Value: {progressVal}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                />
                <Button size="sm" variant="outline" onClick={() => setProgressVal(100)}>
                  Set 100%
                </Button>
              </div>

              {/* Progress Bar Variations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <ProgressBar
                    label="Primary Indigo (md)"
                    value={progressVal}
                    variant="primary"
                  />
                </div>

                <div>
                  <ProgressBar
                    label="Secondary Cyan (md)"
                    value={progressVal}
                    variant="cyan"
                  />
                </div>

                <div>
                  <ProgressBar
                    label="Success Emerald (md)"
                    value={progressVal}
                    variant="success"
                  />
                </div>

                <div>
                  <ProgressBar
                    label="Warning Amber (md)"
                    value={progressVal}
                    variant="warning"
                  />
                </div>

                <div>
                  <ProgressBar
                    label="Danger Red (md)"
                    value={progressVal}
                    variant="danger"
                  />
                </div>

                <div>
                  <ProgressBar
                    label="Smooth Gradient (lg)"
                    value={progressVal}
                    variant="gradient"
                    size="lg"
                    animated
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ===================================================================
            SECTION 5: Rounded Cards & Elevation
            =================================================================== */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Rounded Cards &amp; Elevation</h2>
            <p>Pure white surfaces, subtle borders, soft layered shadows, and hover lifts.</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Stat Card */}
            <Card variant="interactive">
              <Card.Header>
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                  MONTHLY TRAJECTORY
                </span>
                <span style={{ fontSize: '1.25rem' }}>📈</span>
              </Card.Header>
              <Card.Body>
                <div style={{ fontSize: '2.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                  87.4%
                </div>
                <Card.Description>
                  Consistency score across all 4 key discipline tracks.
                </Card.Description>
              </Card.Body>
              <Card.Footer>
                <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>↑ 12% vs last month</span>
                <span>Updated today</span>
              </Card.Footer>
            </Card>

            {/* Objective Preview Card */}
            <Card variant="interactive">
              <Card.Header>
                <span
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                  }}
                >
                  CAREER &amp; TECH
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>📅 Nov 2026</span>
              </Card.Header>
              <Card.Body>
                <Card.Title>Master Distributed Systems</Card.Title>
                <Card.Description>
                  Study high-throughput architecture, write technical briefs, and build scalable systems.
                </Card.Description>
                <div style={{ marginTop: '1rem' }}>
                  <ProgressBar value={65} variant="primary" size="sm" />
                </div>
              </Card.Body>
              <Card.Footer>
                <span>3 of 5 milestones achieved</span>
                <Button size="sm" variant="ghost">View Details &rarr;</Button>
              </Card.Footer>
            </Card>

            {/* Action Card */}
            <Card variant="bordered">
              <Card.Header>
                <Card.Title>Quick Execution</Card.Title>
                <span>⚡</span>
              </Card.Header>
              <Card.Body>
                <Card.Description>
                  Test how interactive cards react with smooth shadow expansion and hover lifts.
                </Card.Description>
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button variant="primary" fullWidth onClick={() => toast.info('Action executed from Card!')}>
                    Execute Quick Task
                  </Button>
                </div>
              </Card.Body>
              <Card.Footer>
                <span>Tagline: "Plan. Progress. Achieve."</span>
              </Card.Footer>
            </Card>
          </div>
        </section>

        {/* ===================================================================
            SECTION 6: Interactive Modal Component
            =================================================================== */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Interactive Modal Dialog</h2>
            <p>Accessible modal with soft backdrop blur, smooth scale animation, and keyboard support.</p>
          </div>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Modal Demonstration</h3>
                <p>Click the trigger below to launch the modal dialog. Try pressing <code>Esc</code> or clicking outside.</p>
              </div>

              <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
                Open Demo Modal
              </Button>
            </div>
          </Card>
        </section>

        {/* ===================================================================
            SECTION 7: Interactive Toast Notification System
            =================================================================== */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Toast Notification System</h2>
            <p>Trigger stacked, floating notifications with auto-dismiss timers and distinct semantic styling.</p>
          </div>

          <Card>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
              Click any button below to trigger live toast notifications:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Button
                variant="success"
                onClick={() => toast.success('Your objective has been logged successfully!', 'Goal Created')}
              >
                ✓ Success Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() => toast.info('System connected to Supabase PostgreSQL.', 'Database Info')}
              >
                ℹ Info Toast
              </Button>

              <Button
                style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}
                onClick={() => toast.warning('Target date is approaching in 3 days.', 'Deadline Warning')}
              >
                ! Warning Toast
              </Button>

              <Button
                variant="danger"
                onClick={() => toast.error('Connection timed out. Please retry.', 'Request Error')}
              >
                ✕ Danger Toast
              </Button>
            </div>
          </Card>
        </section>

      </div>

      {/* Reusable Demo Modal Instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Forge a New Personal Objective"
        description="Set a clear target date, category, and definition of done."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('New objective has been forged successfully!', 'Goal Saved');
              }}
            >
              Save Objective
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Objective Name"
            placeholder="e.g. Master Cloud Distributed Architectures"
            defaultValue="Master Cloud Distributed Architectures"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Target Discipline" defaultValue="Career & Tech" />
            <Input label="Target Completion Date" type="date" defaultValue="2026-11-15" />
          </div>
          <Input
            isTextarea
            rows={3}
            label="Key Deliverables"
            placeholder="Describe what success looks like..."
            defaultValue="Read and synthesize 5 distributed systems papers, complete architecture capstone."
          />
        </div>
      </Modal>
    </div>
  );
}

export default DesignSystemShowcase;
