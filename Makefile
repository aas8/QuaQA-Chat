make pre-publish:
	find . -name '*.vsix' -delete && vsce package