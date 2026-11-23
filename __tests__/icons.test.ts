import * as Icons from '../src/components/icons';

it('every icon used in the UI resolves to a component', () => {
  const names = ['ArrowLeft','CheckCircle2','Droplets','Eye','Gift','HelpCircle','Lightbulb','ListChecks','Lock','Map','Play','RotateCcw','Settings','Sparkles','Sprout','Star','Wind'];
  const missing = names.filter(n => !(Icons as any)[n]);
  expect(missing).toEqual([]);
});
