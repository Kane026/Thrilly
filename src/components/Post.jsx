export default function Post({user_id, content, date, onDelete, currentUserId}) {
return (
    <div>
        <p>{content}</p>
        <p>{user_id}</p>
        <p>{date}</p>
        {currentUserId === user_id && (
            <button onClick={onDelete}>Delete</button>
        )}
    </div>
    );
}
