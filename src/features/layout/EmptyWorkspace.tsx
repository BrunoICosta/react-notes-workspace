import { Icon } from '../../shared/ui/Icon';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './EmptyWorkspace.module.css';

export function EmptyWorkspace() {
  const createPage = useWorkspaceStore((state) => state.createPage);
  const hasPages = useWorkspaceStore((state) => state.rootIds.length > 0);

  return (
    <section className={styles.empty} aria-labelledby="empty-workspace-title">
      <div className={styles.illustration} aria-hidden="true">
        🗒️
      </div>
      <h1 id="empty-workspace-title" className={styles.title}>
        {hasPages ? 'Selecione uma página' : 'Seu workspace está vazio'}
      </h1>
      <p className={styles.text}>
        {hasPages
          ? 'Escolha uma página na barra lateral ou crie uma nova para começar a escrever.'
          : 'Crie sua primeira página para organizar ideias, tarefas e anotações em blocos.'}
      </p>
      <button type="button" className={styles.button} onClick={() => createPage()}>
        <Icon name="plus" />
        Criar página
      </button>
    </section>
  );
}
