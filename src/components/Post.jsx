
export default function Post({user_id, content, date}) {
return (
    <div>
        <p>{content}</p>
        <p>{user_id}</p>
        <p>{date}</p>
    </div>
    );
}
