import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PageTree.module.css';

interface RenameInputProps {
  initialValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

/** Inline text field used to rename a page straight from the sidebar tree. */
export function RenameInput({ initialValue, onSubmit, onCancel }: RenameInputProps) {
  const [value, setValue] = useState(initialValue);
  const { t } = useTranslation(['common', 'workspace']);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const finish = (save: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (save) onSubmit(value.trim());
    else onCancel();
  };

  return (
    <input
      ref={inputRef}
      className={styles.renameInput}
      value={value}
      aria-label={t('workspace:tree.pageName')}
      placeholder={t('untitled')}
      maxLength={200}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => finish(true)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          finish(true);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          finish(false);
        }
      }}
    />
  );
}
